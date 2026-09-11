import type { IncomingMessage } from 'node:http';
import * as path from 'node:path';
import * as libCoverage from 'istanbul-lib-coverage';
import { buildNamespaceMappings, coverageHandler } from '../core/coverage.js';
import {
  BASELINE_RELATIVE_PATH,
  getConfig,
  isCoverageEnabled,
} from '../core/config.js';
import type {
  CoverageMiddlewareOptions,
  TestemMiddlewareOptions,
  ResolvedMiddlewareConfig,
  ExpressLikeApp,
} from '../types.js';

const WRITE_COVERAGE = '/write-coverage';

/**
 * Resolve the namespace mappings for a middleware.
 *
 * `undefined` means "derive them from package.json", `null` means
 * "do not remap at all" — the latter is what Vite builds need, since
 * their coverage keys are already absolute filesystem paths.
 */
function resolveNamespaceMappings(
  namespaceMappings: Map<string, string> | null | undefined,
  root: string,
): Map<string, string> | undefined {
  if (namespaceMappings === null) return undefined;
  return namespaceMappings ?? buildNamespaceMappings(root);
}

/**
 * Create a testem middleware function for coverage collection.
 *
 * When the coverage env var is not `"true"`, the middleware is a no-op.
 * In test mode (default), a single coverage map accumulates coverage
 * across all requests. In dev mode (resetOnRequest: true), a fresh
 * map is created per request.
 *
 * @example
 * ```ts
 * // testem.js
 * const { coverageMiddleware } = require('ember-cli-code-coverage/testem');
 *
 * module.exports = {
 *   test_page: 'tests/index.html?hidepassed',
 *   middleware: [coverageMiddleware()],
 * };
 * ```
 */
export function coverageMiddleware(
  options: TestemMiddlewareOptions = {},
): (app: ExpressLikeApp) => void {
  const root = options.root ?? process.cwd();
  const configPath = options.configPath ?? path.join(root, 'config');
  const coverageConfig = getConfig(configPath);
  const config: ResolvedMiddlewareConfig = {
    root,
    configPath,
    namespaceMappings: resolveNamespaceMappings(
      options.namespaceMappings,
      root,
    ),
    baselinePath:
      options.baselinePath === false
        ? undefined
        : (options.baselinePath ?? path.join(root, BASELINE_RELATIVE_PATH)),
  };

  const resetOnRequest = options.resetOnRequest ?? false;

  return function middleware(app: ExpressLikeApp): void {
    if (!isCoverageEnabled(coverageConfig)) return;

    if (resetOnRequest) {
      app.post(WRITE_COVERAGE, (req, res, next) => {
        const map = libCoverage.createCoverageMap();
        coverageHandler(map, config, req as IncomingMessage, res).catch(next);
      });
    } else {
      const map = libCoverage.createCoverageMap();
      app.post(WRITE_COVERAGE, (req, res, next) => {
        coverageHandler(map, config, req as IncomingMessage, res).catch(next);
      });
    }
  };
}

/**
 * Create a testem middleware for Vite-built apps.
 *
 * `ember test --path dist` serves a prebuilt bundle, so the Vite dev
 * server — and with it the plugin's own `/write-coverage` handler — is
 * not running. This is the endpoint those runs talk to.
 *
 * Namespace remapping is disabled because Vite already emits absolute
 * filesystem paths; remapping them the way classic builds need would
 * double-prefix `app/` and drop every file from the report.
 *
 * @example
 * ```js
 * // testem.cjs
 * const { viteTestemMiddleware } = require('ember-cli-code-coverage/testem');
 *
 * module.exports = {
 *   middleware: [viteTestemMiddleware({ root: __dirname })],
 * };
 * ```
 */
export function viteTestemMiddleware(
  options: Omit<TestemMiddlewareOptions, 'namespaceMappings'> = {},
): (app: ExpressLikeApp) => void {
  return coverageMiddleware({ ...options, namespaceMappings: null });
}

/**
 * Attach coverage middleware to an express app in server mode
 * (fresh map per request).
 */
export function serverMiddleware(
  app: ExpressLikeApp,
  options: CoverageMiddlewareOptions,
): void {
  const coverageConfig = getConfig(options.configPath);
  if (!isCoverageEnabled(coverageConfig)) return;

  const root = options.root ?? process.cwd();
  const config: ResolvedMiddlewareConfig = {
    root,
    configPath: options.configPath,
    namespaceMappings: options.namespaceMappings ?? undefined,
  };

  app.post(WRITE_COVERAGE, (req, res, next) => {
    const map = libCoverage.createCoverageMap();
    coverageHandler(map, config, req as IncomingMessage, res).catch(next);
  });
}

/**
 * Attach coverage middleware to an express app in test mode
 * (accumulated map).
 */
export function testMiddleware(
  app: ExpressLikeApp,
  options: CoverageMiddlewareOptions,
): void {
  const coverageConfig = getConfig(options.configPath);
  if (!isCoverageEnabled(coverageConfig)) return;

  const root = options.root ?? process.cwd();
  const config: ResolvedMiddlewareConfig = {
    root,
    configPath: options.configPath,
    namespaceMappings: options.namespaceMappings ?? undefined,
  };

  const map = libCoverage.createCoverageMap();
  app.post(WRITE_COVERAGE, (req, res, next) => {
    coverageHandler(map, config, req as IncomingMessage, res).catch(next);
  });
}
