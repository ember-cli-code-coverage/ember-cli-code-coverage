import type { Application } from 'express';

export interface MiddlewareConfig {
  root: string;
  configPath: string;
  namespaceMappings: Map<string, string>;
}

/**
 * Express middleware for `ember serve`.
 * Creates a new coverage map on every request.
 */
export function serverMiddleware(
  app: Application,
  config: MiddlewareConfig
): void;

/**
 * Express middleware for `ember test`.
 * Collects the coverage on each request and merges it into the coverage map.
 */
export function testMiddleware(
  app: Application,
  config: MiddlewareConfig
): void;

/**
 * Options for the Vite testem middleware.
 */
export interface ViteTestemMiddlewareOptions {
  /** Project root directory (defaults to process.cwd()) */
  root?: string;
  /** Coverage output folder (defaults to 'coverage') */
  coverageFolder?: string;
  /** Coverage reporters (defaults to ['html', 'lcov', 'json-summary']) */
  reporters?: string[];
}

/**
 * Creates testem middleware for Vite-based projects.
 * This is a simplified middleware that handles coverage collection
 * for Vite builds that don't use ember-cli.
 *
 * @example
 * ```js
 * // testem.cjs
 * const { createViteTestemMiddleware } = require('ember-cli-code-coverage/testem');
 *
 * module.exports = {
 *   middleware: [createViteTestemMiddleware()],
 *   // ... other config
 * };
 * ```
 */
export function createViteTestemMiddleware(
  options?: ViteTestemMiddlewareOptions
): (app: Application) => void;
