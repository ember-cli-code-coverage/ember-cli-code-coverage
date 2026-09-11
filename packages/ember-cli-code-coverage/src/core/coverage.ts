import * as path from 'node:path';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import * as libCoverage from 'istanbul-lib-coverage';
import * as libReport from 'istanbul-lib-report';
import * as libSourceMaps from 'istanbul-lib-source-maps';
import { getConfig } from './config.js';
import { createReport } from './reports.js';
import type {
  CoverageData,
  ModifyAssetLocationFn,
  ResolvedMiddlewareConfig,
  ServerResponseLike,
} from '../types.js';

const sourceMapStore = libSourceMaps.createSourceMapStore();

/** Maximum body size for coverage data: 50 MB */
const MAX_BODY_SIZE = 50 * 1024 * 1024;

/**
 * Read and parse a JSON request body from an HTTP request stream.
 * Works with both Express and Connect (Vite) request objects.
 * Enforces a maximum body size to prevent memory exhaustion.
 */
export function readJsonBody(req: IncomingMessage): Promise<CoverageData> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalSize = 0;
    req.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        req.destroy();
        reject(
          new Error(
            `Coverage payload exceeds maximum size of ${MAX_BODY_SIZE} bytes`,
          ),
        );
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(
          JSON.parse(Buffer.concat(chunks).toString('utf-8')) as CoverageData,
        );
      } catch (err) {
        reject(
          new Error(`Failed to parse coverage JSON: ${(err as Error).message}`),
        );
      }
    });
    req.on('error', reject);
  });
}

/**
 * Normalize duplicated path segments from ember-template-import sourcemaps
 * in GJS/GTS files.
 *
 * Example: "my-app/components/my-app/components/file.gjs"
 *       → "my-app/components/file.gjs"
 */
export function normalizePathForTemplateImports(filepath: string): string {
  const parts = filepath.split(path.sep);
  const lastIndexOfTopDir = parts.lastIndexOf(parts[0]!);

  // No duplication — return as-is (e.g., v2 addon test paths)
  if (lastIndexOfTopDir === 0) {
    return filepath;
  }

  return parts.filter((_, index) => index >= lastIndexOfTopDir).join(path.sep);
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Cache for package.json reads keyed by path. */
const pkgJsonCache = new Map<
  string,
  { 'ember-addon'?: { paths?: string[] } }
>();

/**
 * Normalize a file path from Embroider's temp directory to a
 * project-relative path.
 *
 * Handles both Embroider >=3.1 (.embroider/rewritten-app/) and
 * <3.1 (/tmp/embroider/XXXXXX/) temp directory layouts, as well
 * as in-repo addon paths.
 */
export function normalizeEmbroiderPath(root: string, filepath: string): string {
  let relativePath: string;
  const embroiderGT31Regex = /\.embroider\/rewritten-app\//;
  const embroiderLT31Regex = /embroider\/.{6}/;

  if (embroiderGT31Regex.test(filepath)) {
    relativePath = filepath.split(embroiderGT31Regex)[1]!;
  } else {
    relativePath = filepath.split(embroiderLT31Regex)[1]!.slice(1);
  }

  // Handle in-repo addon paths
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let pkgJSON = pkgJsonCache.get(pkgPath);
    if (!pkgJSON) {
      pkgJSON = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
        'ember-addon'?: { paths?: string[] };
      };
      pkgJsonCache.set(pkgPath, pkgJSON);
    }
    const inRepoPaths = pkgJSON['ember-addon']?.paths ?? [];

    for (const inRepoPath of inRepoPaths) {
      const inRepoRegex = new RegExp('[^/]+/' + escapeRegex(inRepoPath), 'gi');
      if (
        inRepoRegex.test(relativePath) ||
        relativePath.startsWith(inRepoPath)
      ) {
        relativePath = path.join(
          inRepoPath.split(path.sep).slice(-1)[0]!,
          filepath.split(inRepoPath)[1]!,
        );
        break;
      }
    }
  }

  return relativePath;
}

/**
 * Convert an absolute file path to a project-relative path.
 *
 * Handles Embroider temp directories, GJS/GTS template import quirks,
 * namespace mappings, and monorepo paths.
 */
export function adjustCoverageKey(
  root: string,
  filepath: string,
  namespaceMappings?: Map<string, string>,
  modifyAssetLocation?: ModifyAssetLocationFn,
): string {
  const embroiderRegex = /embroider\/.{6}/;
  const gjsGtsRegex = /\.g[tj]s$/;

  let relativePath = path.relative(root, filepath);

  if (embroiderRegex.test(filepath)) {
    relativePath = normalizeEmbroiderPath(root, filepath);
  } else if (relativePath.startsWith('..')) {
    // File is outside the project root (e.g., monorepo sibling package)
    return filepath;
  }

  if (gjsGtsRegex.test(relativePath)) {
    relativePath = normalizePathForTemplateImports(relativePath);
  }

  // Without namespace mappings, return resolved path directly
  if (!namespaceMappings) {
    return path.join(root, relativePath);
  }

  let namespace: string;
  let pathWithoutNamespace: string[];

  if (relativePath.startsWith('@')) {
    namespace = relativePath.split(path.sep).slice(0, 2).join('/');
    pathWithoutNamespace = relativePath.split(path.sep).slice(2);
  } else {
    namespace = relativePath.split(path.sep)[0]!;
    pathWithoutNamespace = relativePath.split(path.sep).slice(1);
  }

  let namespaceKey = namespace;

  if (pathWithoutNamespace[0] === 'test-support') {
    namespaceKey = path.join(namespace, 'test-support');
    pathWithoutNamespace = pathWithoutNamespace.slice(1);
  }

  if (modifyAssetLocation) {
    const customPath = modifyAssetLocation(
      root,
      relativePath,
      filepath,
      namespaceMappings,
    );
    if (customPath) return customPath;
  }

  if (namespaceMappings.has(namespaceKey)) {
    return path.join(
      ...[namespaceMappings.get(namespaceKey)!, ...pathWithoutNamespace],
    );
  }

  // Fallback: default "/" namespace for Embroider edge cases
  if (namespaceMappings.has('/')) {
    return path.join(namespaceMappings.get('/')!, relativePath);
  }

  return path.join(root, relativePath);
}

interface CoverageOptions {
  root: string;
  namespaceMappings?: Map<string, string>;
  configPath?: string;
}

/**
 * Adjust all coverage keys in a coverage data object to use
 * project-relative paths.
 */
export function adjustCoverage(
  coverage: Record<string, { data: { path: string } }>,
  options: CoverageOptions,
): Record<string, { path: string }> {
  const { root, namespaceMappings, configPath } = options;
  const config = getConfig(configPath);
  const { modifyAssetLocation } = config;

  return Object.keys(coverage).reduce(
    (memo, filePath) => {
      const resolvedPath = adjustCoverageKey(
        root,
        filePath,
        namespaceMappings,
        modifyAssetLocation,
      );
      const relativePath = path.relative(root, resolvedPath);
      coverage[filePath]!.data.path = relativePath;
      memo[relativePath] = coverage[filePath]!.data;
      return memo;
    },
    {} as Record<string, { path: string }>,
  );
}

/**
 * Process raw coverage data through source maps and merge into
 * a coverage map.
 */
export async function writeCoverage(
  coverage: CoverageData,
  options: CoverageOptions,
  map: libCoverage.CoverageMap,
): Promise<void> {
  const { root } = options;

  const remappedCoverage = await sourceMapStore.transformCoverage(
    libCoverage.createCoverageMap(coverage as libCoverage.CoverageMapData),
  );

  const adjustedCoverage = adjustCoverage(
    remappedCoverage.data as unknown as Record<
      string,
      { data: { path: string } }
    >,
    options,
  );

  for (const [relativePath, cov] of Object.entries(adjustedCoverage)) {
    if (fs.existsSync(path.join(root, relativePath))) {
      map.addFileCoverage(cov as unknown as libCoverage.FileCoverageData);
    }
  }
}

/**
 * Generate coverage reports from a coverage map.
 */
export function reportCoverage(
  map: libCoverage.CoverageMap,
  root: string,
  configPath?: string,
): void {
  const config = getConfig(configPath);
  const { reporters } = config;

  if (config.parallel) {
    config.coverageFolder =
      config.coverageFolder + '_' + crypto.randomBytes(4).toString('hex');
    if (!reporters.includes('json')) {
      reporters.push('json');
    }
  }

  if (!reporters.includes('json-summary')) {
    reporters.push('json-summary');
  }

  const context = libReport.createContext({
    dir: path.join(root, config.coverageFolder),
    watermarks: libReport.getDefaultWatermarks(),
    coverageMap: map,
  });

  for (const reporter of reporters) {
    createReport(reporter).execute(context);
  }
}

/** Coverage maps that already had their baseline seeded. */
const seededMaps = new WeakSet<libCoverage.CoverageMap>();

/**
 * Seed a coverage map from a zero-filled baseline written at build time.
 *
 * Vite builds only execute modules something imports, so a file no test
 * reaches never reports at all. Seeding the baseline puts it back in the
 * report at 0% instead of dropping it. A missing baseline file is normal
 * — classic and Embroider builds do not write one.
 */
export async function seedBaseline(
  map: libCoverage.CoverageMap,
  options: ResolvedMiddlewareConfig,
): Promise<void> {
  const { baselinePath } = options;

  if (!baselinePath || seededMaps.has(map)) return;
  seededMaps.add(map);

  if (!fs.existsSync(baselinePath)) return;

  try {
    const baseline = JSON.parse(
      fs.readFileSync(baselinePath, 'utf-8'),
    ) as CoverageData;
    await writeCoverage(baseline, options, map);
  } catch (err) {
    console.warn(
      `[ember-cli-code-coverage] Could not read coverage baseline at ${baselinePath}:`,
      (err as Error).message,
    );
  }
}

/**
 * Handle a coverage write request: parse the body, write & report.
 * Shared implementation used by both testem and vite middleware.
 */
export async function coverageHandler(
  map: libCoverage.CoverageMap,
  options: ResolvedMiddlewareConfig,
  req: IncomingMessage,
  res: ServerResponseLike,
): Promise<void> {
  try {
    const body = await readJsonBody(req);
    await seedBaseline(map, options);
    await writeCoverage(body, options, map);
    reportCoverage(map, options.root, options.configPath);

    const summary = map.getCoverageSummary().toJSON();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(summary));
  } catch (err) {
    console.error('[ember-cli-code-coverage] Error processing coverage:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (err as Error).message }));
  }
}

/**
 * Build a namespace-to-directory mapping from an Ember project's
 * package.json. This is needed to convert runtime module names back
 * to on-disk file paths for coverage reporting.
 *
 * @param root - Project root directory
 * @returns A Map from module namespace to directory path
 */
export function buildNamespaceMappings(root: string): Map<string, string> {
  const mappings = new Map<string, string>();
  const pkgPath = path.join(root, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return mappings;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
    name?: string;
    keywords?: string[];
    'ember-addon'?: { paths?: string[] };
  };

  const moduleName = pkg.name ?? '';
  const isAddon =
    (pkg.keywords ?? []).includes('ember-addon') || !!pkg['ember-addon'];

  if (isAddon) {
    mappings.set(moduleName, 'addon');
    mappings.set(`${moduleName}/test-support`, 'addon-test-support');
  } else {
    mappings.set(moduleName, 'app');
  }

  // Handle in-repo addons
  const inRepoPaths = pkg['ember-addon']?.paths ?? [];
  for (const inRepoPath of inRepoPaths) {
    const addonPkgPath = path.join(root, inRepoPath, 'package.json');
    if (fs.existsSync(addonPkgPath)) {
      const addonPkg = JSON.parse(fs.readFileSync(addonPkgPath, 'utf-8')) as {
        name?: string;
      };
      const addonName = addonPkg.name ?? path.basename(inRepoPath);
      mappings.set(addonName, path.join(inRepoPath, 'addon'));
      mappings.set(
        `${addonName}/test-support`,
        path.join(inRepoPath, 'addon-test-support'),
      );
    }
  }

  return mappings;
}
