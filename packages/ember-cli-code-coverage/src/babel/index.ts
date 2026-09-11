import * as fs from 'node:fs';
import * as path from 'node:path';
import { isCoverageEnabled } from '../core/config.js';
import type { BuildBabelPluginOptions, CoverageConfig } from '../types.js';

/**
 * Embroider >= 3.1 rewrites the app into
 * `node_modules/.embroider/rewritten-app/`, so the usual node_modules
 * exclusion would swallow every one of the app's own files. This negated
 * pattern puts them back; `test-exclude` treats a leading `!` as
 * "instrument this even if an exclude matched".
 *
 * Addons are not affected: Embroider rewrites those into
 * `rewritten-packages/`, which stays excluded.
 */
const EMBROIDER_APP_REINCLUDE = '!**/.embroider/rewritten-app/**';

/**
 * Absolute root of this installed copy of the addon (two levels up from
 * `dist/babel/`, or `src/babel/` when run against source directly).
 *
 * Used to exclude the addon's own files from instrumentation. A name-based
 * glob like `**\/ember-cli-code-coverage/**` would look tempting, but it
 * also matches a checkout of this very repo when developing the addon
 * itself, since the repo's own root directory is named
 * `ember-cli-code-coverage` — that pattern would silently exclude every
 * fixture along with it. Deriving the exclude from `__dirname` instead
 * targets exactly this installed copy, and only this copy, in a real
 * consumer's `node_modules` or in a workspace-linked monorepo checkout
 * alike.
 */
const OWN_PACKAGE_ROOT = path.resolve(__dirname, '..', '..');

/**
 * `OWN_PACKAGE_ROOT` as an exclude glob.
 *
 * Istanbul's `cwd` is hardcoded to `/` above, and `test-exclude` matches
 * patterns against each file's path *relative to that cwd* — which, for an
 * absolute POSIX path, is the same string with its leading slash stripped.
 * A pattern that still had the leading slash would never match anything,
 * exactly like every other exclude in this file (none of them have one).
 */
const SELF_EXCLUDE = `${OWN_PACKAGE_ROOT.split(path.sep).join('/').replace(/^\/+/, '')}/**`;

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
export function buildBabelPlugin(
  options: BuildBabelPluginOptions = {},
): unknown[] {
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
    '../../src/babel/gjs-gts-istanbul-ignore-template-plugin.cjs',
  );

  // Use '/' as the istanbul cwd so instrumentation works regardless of
  // where the build tool places source files. Embroider v3 relocates
  // app files to a temporary directory during the Webpack build phase;
  // using the original project cwd would cause babel-plugin-istanbul's
  // test-exclude to reject every file as "outside cwd" since
  // path.relative(projectDir, tempFile) starts with "..".
  // Setting cwd to '/' ensures all absolute paths pass the check while
  // the include/exclude globs (using **/ prefixes) still filter correctly.
  const istanbulOptions: Record<string, unknown> = {
    cwd: '/',
    include: '**/*',
    exclude: [...exclude, EMBROIDER_APP_REINCLUDE, SELF_EXCLUDE],
    extension,
  };

  if (options.onCover) {
    istanbulOptions.onCover = options.onCover;
  }

  return [gjsGtsPlugin, [istanbulPlugin, istanbulOptions]];
}
