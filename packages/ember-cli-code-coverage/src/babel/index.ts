import * as fs from 'node:fs';
import * as path from 'node:path';
import { isCoverageEnabled } from '../core/config.js';
import type { BuildBabelPluginOptions, CoverageConfig } from '../types.js';

/**
 * Build the array of Babel plugins needed for Istanbul code coverage
 * instrumentation.
 *
 * Returns an empty array if coverage is not enabled (via the COVERAGE
 * environment variable or a custom env var from config).
 *
 * @example
 * ```ts
 * // In babel.config.cjs
 * const { buildBabelPlugin } = require('ember-cli-code-coverage/babel');
 * module.exports = {
 *   plugins: [...buildBabelPlugin()],
 * };
 * ```
 *
 * @example
 * ```ts
 * // In vite.config.mjs with @rollup/plugin-babel
 * import { buildBabelPlugin } from 'ember-cli-code-coverage/babel';
 * import { babel } from '@rollup/plugin-babel';
 *
 * export default defineConfig({
 *   plugins: [
 *     babel({
 *       plugins: [...buildBabelPlugin()],
 *       extensions: ['.js', '.ts', '.gjs', '.gts'],
 *     }),
 *   ],
 * });
 * ```
 */
export function buildBabelPlugin(options: BuildBabelPluginOptions = {}): unknown[] {
  // projectRoot is used for resolving config files on disk.
  // It is intentionally separate from the istanbul cwd (see below).
  const projectRoot = options.cwd ?? process.cwd();
  let exclude = options.exclude ?? ['**/mirage/**/*', '**/node_modules/**/*'];
  const extension = options.extension ?? [
    '.gjs',
    '.gts',
    '.js',
    '.ts',
    '.cjs',
    '.mjs',
    '.mts',
    '.cts',
  ];
  let coverageEnvVar = options.coverageEnvVar ?? 'COVERAGE';

  // Load config from project if available
  const configBase = options.configPath ?? 'config';
  const coverageConfigPath = path.isAbsolute(configBase)
    ? path.join(configBase, 'coverage.js')
    : path.join(projectRoot, configBase, 'coverage.js');

  if (fs.existsSync(coverageConfigPath)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require(coverageConfigPath) as Partial<CoverageConfig>;
    if (config.excludes) exclude = config.excludes;
    if (config.coverageEnvVar) coverageEnvVar = config.coverageEnvVar;
  }

  if (!isCoverageEnabled({ coverageEnvVar })) {
    return [];
  }

  const istanbulPlugin = require.resolve('babel-plugin-istanbul');
  const gjsGtsPlugin = path.resolve(
    __dirname,
    '../../src/babel/gjs-gts-istanbul-ignore-template-plugin.cjs'
  );

  // Use '/' as the istanbul cwd so instrumentation works regardless of
  // where the build tool places source files. Embroider v3 relocates
  // app files to a temporary directory during the Webpack build phase;
  // using the original project cwd would cause babel-plugin-istanbul's
  // test-exclude to reject every file as "outside cwd" since
  // path.relative(projectDir, tempFile) starts with "..".
  // Setting cwd to '/' ensures all absolute paths pass the check while
  // the include/exclude globs (using **/ prefixes) still filter correctly.
  return [gjsGtsPlugin, [istanbulPlugin, { cwd: '/', include: '**/*', exclude, extension }]];
}
