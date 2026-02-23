import type { IncomingMessage, ServerResponse } from 'node:http';
import * as libCoverage from 'istanbul-lib-coverage';
import { coverageHandler, buildNamespaceMappings } from '../core/coverage.js';
import { isCoverageEnabled, getConfig } from '../core/config.js';
import type { ViteCoveragePluginOptions, ResolvedMiddlewareConfig } from '../types.js';

const WRITE_COVERAGE = '/write-coverage';

interface VitePlugin {
  name: string;
  configureServer?: (server: { middlewares: { use: (fn: unknown) => void } }) => void;
}

/**
 * Vite plugin that provides a `/write-coverage` middleware endpoint
 * for collecting Istanbul coverage data during dev/test builds.
 *
 * @example
 * ```ts
 * // vite.config.mjs
 * import { defineConfig } from 'vite';
 * import { coveragePlugin } from 'ember-cli-code-coverage/vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     coveragePlugin({ root: __dirname }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```ts
 * // vite.config.mjs — with babel for instrumentation
 * import { defineConfig } from 'vite';
 * import { coveragePlugin } from 'ember-cli-code-coverage/vite';
 * import { buildBabelPlugin } from 'ember-cli-code-coverage/babel';
 * import { babel } from '@rollup/plugin-babel';
 *
 * export default defineConfig({
 *   plugins: [
 *     coveragePlugin(),
 *     babel({
 *       plugins: [...buildBabelPlugin()],
 *       extensions: ['.js', '.ts', '.gjs', '.gts'],
 *       babelHelpers: 'inline',
 *     }),
 *   ],
 * });
 * ```
 */
export function coveragePlugin(options: ViteCoveragePluginOptions = {}): VitePlugin {
  const config = getConfig(options.configPath);
  const enabled = options.enabled ?? isCoverageEnabled(config);

  if (!enabled) {
    return { name: 'ember-cli-code-coverage' };
  }

  const root = options.root ?? process.cwd();
  const middlewareConfig: ResolvedMiddlewareConfig = {
    root,
    configPath: options.configPath,
    namespaceMappings: options.namespaceMappings ?? buildNamespaceMappings(root),
  };

  const map = libCoverage.createCoverageMap();

  return {
    name: 'ember-cli-code-coverage',

    configureServer(server) {
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.method !== 'POST' || req.url !== WRITE_COVERAGE) {
            return next();
          }

          await coverageHandler(map, middlewareConfig, req, res);
        }
      );
    },
  };
}
