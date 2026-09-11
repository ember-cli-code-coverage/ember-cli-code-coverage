import type { IncomingMessage, ServerResponse } from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as libCoverage from 'istanbul-lib-coverage';
import { coverageHandler } from '../core/coverage.js';
import {
  isCoverageEnabled,
  getConfig,
  DEFAULT_CONFIG,
  BASELINE_RELATIVE_PATH,
} from '../core/config.js';
import { buildBabelPlugin } from '../babel/index.js';
import type {
  ViteCoveragePluginOptions,
  ResolvedMiddlewareConfig,
} from '../types.js';

const WRITE_COVERAGE = '/write-coverage';

/**
 * Exclusion globs for Vite. The classic defaults are written against
 * module-namespaced paths, so they never match the absolute filesystem
 * paths Vite hands to a transform hook.
 */
const VITE_DEFAULT_EXCLUDES = ['**/node_modules/**', '**/mirage/**'];

const DEFAULT_EXTENSIONS = ['.js', '.ts', '.gjs', '.gts', '.mjs', '.mts'];

interface ViteTransformResult {
  code: string;
  map?: unknown;
}

interface TransformContext {
  getCombinedSourcemap?: () => unknown;
}

interface VitePlugin {
  name: string;
  enforce?: 'pre' | 'post';
  configResolved?: (config: { root: string }) => void;
  transform?: (
    this: TransformContext,
    code: string,
    id: string,
  ) => Promise<ViteTransformResult | null>;
  buildEnd?: () => void;
  configureServer?: (server: {
    middlewares: { use: (fn: unknown) => void };
  }) => void;
}

/**
 * Strip Vite's query suffixes (`?v=hash`, `?worker`, …) from a module id.
 */
function cleanId(id: string): string {
  const queryIndex = id.indexOf('?');
  return queryIndex === -1 ? id : id.slice(0, queryIndex);
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Vite plugins that instrument application code with Istanbul and collect
 * the results.
 *
 * Instrumentation runs `enforce: 'post'`, after Ember's own transforms, so
 * Istanbul always sees plain JavaScript rather than `.gjs`/`.gts` source
 * that still contains a `<template>` tag.
 *
 * Two collection paths exist because Ember apps test against a built
 * bundle. `vite dev` and `vite preview` get the endpoint from
 * `configureServer` here; `ember test --path dist` gets it from this
 * addon's testem middleware, which runs when no Vite server is up.
 *
 * @example
 * ```js
 * // vite.config.mjs
 * import { defineConfig } from 'vite';
 * import { classicEmberSupport, ember, extensions } from '@embroider/vite';
 * import { babel } from '@rollup/plugin-babel';
 * import { coveragePlugin } from 'ember-cli-code-coverage/vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     classicEmberSupport(),
 *     ember(),
 *     ...coveragePlugin(),
 *     babel({ babelHelpers: 'runtime', extensions }),
 *   ],
 * });
 * ```
 */
export function coveragePlugin(
  options: ViteCoveragePluginOptions = {},
): VitePlugin[] {
  const config = getConfig(options.configPath);
  const enabled = options.enabled ?? isCoverageEnabled(config);

  if (!enabled) {
    return [];
  }

  // Only fall back to Vite-shaped globs when the project has not written
  // its own; a custom `config/coverage.js` stays authoritative.
  const exclude =
    options.exclude ??
    (sameList(config.excludes, DEFAULT_CONFIG.excludes)
      ? VITE_DEFAULT_EXCLUDES
      : config.excludes);

  return [
    instrumentationPlugin({ ...options, exclude }),
    coverageServerPlugin(options),
  ];
}

/**
 * Instrument modules as Vite builds them, and record a zero-filled
 * baseline for every file touched.
 */
export function instrumentationPlugin(
  options: ViteCoveragePluginOptions = {},
): VitePlugin {
  const extension = options.extension ?? DEFAULT_EXTENSIONS;
  const exclude = options.exclude ?? VITE_DEFAULT_EXCLUDES;
  const wantsBaseline = options.baseline ?? true;

  const baseline = new Map<string, unknown>();
  let root = options.root ?? process.cwd();

  const plugins = buildBabelPlugin({
    cwd: root,
    configPath: options.configPath,
    exclude,
    extension,
    onCover: (filename, fileCoverage) => {
      if (wantsBaseline) baseline.set(filename, fileCoverage);
    },
  });

  return {
    name: 'ember-cli-code-coverage:instrument',

    // After Ember's transforms, so `.gjs`/`.gts` have already become JS.
    enforce: 'post',

    configResolved(resolved) {
      root = resolved.root;
    },

    async transform(code, id) {
      const filename = cleanId(id);

      // Virtual modules have no file on disk to report coverage against.
      if (
        filename.startsWith('\0') ||
        !extension.some((ext) => filename.endsWith(ext))
      ) {
        return null;
      }

      const { transformAsync } = await loadBabel();

      // Chain onto the maps Ember's transforms already produced so
      // coverage positions land on the original source, not compiled output.
      let inputSourceMap: unknown;
      try {
        inputSourceMap = this.getCombinedSourcemap?.();
      } catch {
        inputSourceMap = undefined;
      }

      const result = await transformAsync(code, {
        filename,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        inputSourceMap: inputSourceMap as never,
        plugins: plugins as never[],
      });

      if (!result?.code) return null;

      return { code: result.code, map: result.map };
    },

    buildEnd() {
      if (!wantsBaseline || baseline.size === 0) return;

      const target = path.join(root, BASELINE_RELATIVE_PATH);

      try {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, JSON.stringify(Object.fromEntries(baseline)));
      } catch (err) {
        console.warn(
          '[ember-cli-code-coverage] Could not write coverage baseline:',
          (err as Error).message,
        );
      }
    },
  };
}

/**
 * Serve `/write-coverage` from the Vite dev server. Only relevant for
 * `vite dev` and `vite preview`; `ember test --path dist` is served by
 * the testem middleware instead.
 */
export function coverageServerPlugin(
  options: ViteCoveragePluginOptions = {},
): VitePlugin {
  let root = options.root ?? process.cwd();
  const map = libCoverage.createCoverageMap();

  return {
    name: 'ember-cli-code-coverage:server',

    configResolved(resolved) {
      root = resolved.root;
    },

    configureServer(server) {
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.method !== 'POST' || req.url !== WRITE_COVERAGE) {
            return next();
          }

          const middlewareConfig: ResolvedMiddlewareConfig = {
            root,
            configPath: options.configPath,
            // Vite coverage keys are already absolute filesystem paths.
            namespaceMappings: undefined,
            baselinePath: path.join(root, BASELINE_RELATIVE_PATH),
          };

          await coverageHandler(map, middlewareConfig, req, res);
        },
      );
    },
  };
}

interface BabelCore {
  transformAsync: (
    code: string,
    options: Record<string, unknown>,
  ) => Promise<{ code?: string | null; map?: unknown } | null>;
}

let babelCore: BabelCore | undefined;

/**
 * `@babel/core` is loaded lazily: classic builds never need it here, and
 * every Ember Vite app already depends on it for template compilation.
 */
async function loadBabel(): Promise<BabelCore> {
  if (babelCore) return babelCore;

  try {
    babelCore = (await import('@babel/core')) as unknown as BabelCore;
  } catch {
    throw new Error(
      '[ember-cli-code-coverage] Vite coverage needs @babel/core. Install it as a devDependency.',
    );
  }

  return babelCore;
}
