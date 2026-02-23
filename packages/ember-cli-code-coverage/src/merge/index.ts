#!/usr/bin/env node

import * as path from 'node:path';
import * as fs from 'node:fs';
import * as libCoverage from 'istanbul-lib-coverage';
import * as libReport from 'istanbul-lib-report';
import { getConfig } from '../core/config.js';
import { createReport } from '../core/reports.js';

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface MergeOptions {
  /** Project root directory (default: process.cwd()) */
  root?: string;
  /** Path to coverage config (directory or file) */
  configPath?: string;
}

/**
 * Merge coverage files created from parallel test runs.
 *
 * Reads all `coverage-final.json` files from directories matching
 * `coverageFolder_*` and merges them into a single report.
 *
 * @example
 * ```ts
 * import { mergeCoverage } from 'ember-cli-code-coverage/merge';
 * await mergeCoverage({ root: process.cwd(), configPath: 'config' });
 * ```
 */
export async function mergeCoverage(options: MergeOptions = {}): Promise<void> {
  const root = options.root ?? process.cwd();
  const config = getConfig(options.configPath);

  const coverageFolderParts = config.coverageFolder.split('/');
  const coverageFolder = coverageFolderParts.pop()!;
  const coverageRoot = path.join(root, ...coverageFolderParts);
  const coverageDirRegex = new RegExp(`^${escapeRegex(coverageFolder)}_.*`);

  if (!fs.existsSync(coverageRoot)) {
    console.warn(`[ember-cli-code-coverage] Coverage root does not exist: ${coverageRoot}`);
    return;
  }

  const map = libCoverage.createCoverageMap();

  // Find all parallel coverage directories
  const entries = fs.readdirSync(coverageRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !coverageDirRegex.test(entry.name)) {
      continue;
    }

    const coverageFile = path.join(coverageRoot, entry.name, 'coverage-final.json');

    if (fs.existsSync(coverageFile)) {
      try {
        const coverageData = JSON.parse(
          fs.readFileSync(coverageFile, 'utf-8')
        ) as libCoverage.CoverageMapData;
        map.merge(coverageData);
      } catch (err) {
        console.error(
          `[ember-cli-code-coverage] Failed to parse ${coverageFile}:`,
          (err as Error).message
        );
      }
    }
  }

  const { reporters } = config;

  if (!reporters.includes('json-summary')) {
    reporters.push('json-summary');
  }

  const context = libReport.createContext({
    dir: path.join(coverageRoot, coverageFolder),
    watermarks: libReport.getDefaultWatermarks(),
    coverageMap: map,
  });

  for (const reporter of reporters) {
    createReport(reporter).execute(context);
  }
}
