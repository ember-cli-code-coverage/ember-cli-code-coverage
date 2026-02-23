import type { IncomingMessage } from 'node:http';
import * as path from 'node:path';
import * as libCoverage from 'istanbul-lib-coverage';
import { buildNamespaceMappings, coverageHandler } from '../core/coverage.js';
import { getConfig, isCoverageEnabled } from '../core/config.js';
import type {
  CoverageMiddlewareOptions,
  TestemMiddlewareOptions,
  ResolvedMiddlewareConfig,
  ExpressLikeApp,
} from '../types.js';

const WRITE_COVERAGE = '/write-coverage';

/**
 * Create a testem middleware function for coverage collection.
 *
 * When COVERAGE env var is not `"true"`, the middleware is a no-op.
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
  options: TestemMiddlewareOptions = {}
): (app: ExpressLikeApp) => void {
  const root = options.root ?? process.cwd();
  const configPath = options.configPath ?? path.join(root, 'config');
  const coverageConfig = getConfig(configPath);
  const config: ResolvedMiddlewareConfig = {
    root,
    configPath,
    namespaceMappings: options.namespaceMappings ?? buildNamespaceMappings(root),
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
 * Attach coverage middleware to an express app in server mode
 * (fresh map per request).
 */
export function serverMiddleware(app: ExpressLikeApp, options: CoverageMiddlewareOptions): void {
  const coverageConfig = getConfig(options.configPath);
  if (!isCoverageEnabled(coverageConfig)) return;

  const config: ResolvedMiddlewareConfig = {
    root: options.root ?? process.cwd(),
    configPath: options.configPath,
    namespaceMappings: options.namespaceMappings,
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
export function testMiddleware(app: ExpressLikeApp, options: CoverageMiddlewareOptions): void {
  const coverageConfig = getConfig(options.configPath);
  if (!isCoverageEnabled(coverageConfig)) return;

  const config: ResolvedMiddlewareConfig = {
    root: options.root ?? process.cwd(),
    configPath: options.configPath,
    namespaceMappings: options.namespaceMappings,
  };

  const map = libCoverage.createCoverageMap();
  app.post(WRITE_COVERAGE, (req, res, next) => {
    coverageHandler(map, config, req as IncomingMessage, res).catch(next);
  });
}
