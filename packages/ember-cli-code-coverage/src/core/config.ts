import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CoverageConfig } from '../types.js';

/**
 * Location of the zero-filled coverage baseline, relative to the project
 * root. Written by the Vite plugin at build time and read back by
 * whichever middleware serves `/write-coverage`.
 */
export const BASELINE_RELATIVE_PATH = path.join(
  'node_modules',
  '.cache',
  'ember-cli-code-coverage',
  'baseline.json',
);

/**
 * Marks a strict-mode template's coverage key so it doesn't resolve to a
 * real file on disk. See the comment above its one call site in
 * `glimmer/index.ts` for why: briefly, a `.gjs`/`.gts` file's *own* JS
 * coverage entry has a real source map, and letting that map get applied
 * to the template's already-original positions crashes reporting.
 * `adjustCoverageKey` strips this back off, so the entry still lands
 * under the real file's report key.
 */
export const TEMPLATE_COVERAGE_KEY_SUFFIX = '?template-coverage';

export const DEFAULT_CONFIG: Readonly<CoverageConfig> = Object.freeze({
  coverageEnvVar: 'COVERAGE',
  coverageFolder: 'coverage',
  excludes: ['*/mirage/**/*'],
  reporters: ['html', 'lcov'],
  templateCoverage: false,
});

/**
 * Load coverage configuration.
 *
 * Accepts multiple formats:
 * - A directory containing coverage.js (e.g., "config")
 * - A direct path to coverage.js
 * - An ember-cli configPath (e.g., "tests/dummy/config/environment")
 *
 * @param configPathOrDir - Path to configuration
 * @returns Merged configuration
 */
export function getConfig(configPathOrDir?: string): CoverageConfig {
  /** Deep-clone DEFAULT_CONFIG so callers can safely mutate arrays. */
  const cloneDefaults = (): CoverageConfig => ({
    ...DEFAULT_CONFIG,
    excludes: [...DEFAULT_CONFIG.excludes],
    reporters: [...DEFAULT_CONFIG.reporters],
  });

  if (!configPathOrDir) {
    return cloneDefaults();
  }

  const candidates: string[] = [
    // Direct path to coverage.js
    ...(configPathOrDir.endsWith('coverage.js')
      ? [path.resolve(configPathOrDir)]
      : []),
    // Directory containing coverage.js
    path.resolve(configPathOrDir, 'coverage.js'),
    // Ember-cli style configPath (dirname + coverage.js)
    path.resolve(path.dirname(configPathOrDir), 'coverage.js'),
  ];

  // Deduplicate resolved candidates
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);

    if (fs.existsSync(candidate)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const projectConfig = require(candidate) as Partial<CoverageConfig>;
        return { ...cloneDefaults(), ...projectConfig };
      } catch (err) {
        console.error(
          `[ember-cli-code-coverage] Failed to load config from ${candidate}:`,
          (err as Error).message,
        );
      }
    }
  }

  return cloneDefaults();
}

/**
 * Check if coverage collection is enabled via environment variable.
 * @param config - Configuration object (or uses defaults)
 * @returns Whether coverage is enabled
 */
export function isCoverageEnabled(config?: Partial<CoverageConfig>): boolean {
  const envVar = config?.coverageEnvVar ?? DEFAULT_CONFIG.coverageEnvVar;
  return process.env[envVar] === 'true';
}
