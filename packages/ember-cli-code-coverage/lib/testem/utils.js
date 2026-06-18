'use strict';

const path = require('path');
const fs = require('fs');

/**
 * @typedef {Object} FilteredCoverageEntry
 * @property {string} relativePath - Path relative to root
 * @property {Object} data - Istanbul coverage data
 */

/**
 * Check if a path is a virtual module (contains null bytes)
 * @param {string} filepath
 * @returns {boolean}
 */
function isVirtualModule(filepath) {
  return filepath.includes('\x00') || filepath.includes('\0');
}

/**
 * Check if a path should be excluded from coverage
 * @param {string} relativePath
 * @returns {boolean}
 */
function shouldExcludePath(relativePath) {
  return relativePath.includes('node_modules') || path.isAbsolute(relativePath);
}

/**
 * Check if a path is a GJS/GTS file
 * @param {string} filepath
 * @returns {boolean}
 */
function isGjsGtsFile(filepath) {
  return /\.g[tj]s$/.test(filepath);
}

/**
 * ember-template-import has weird sourcemaps for gjs/gts
 * so we need to do some custom path remapping.
 * Example: `my-app/components/my-app/components/file.gjs` -> `my-app/components/file.gjs`
 * @param {string} filepath
 * @returns {string}
 */
function normalizePathForTemplateImports(filepath) {
  const filepathArray = filepath.split(path.sep);
  const lastIndexOfTopDirName = filepathArray.lastIndexOf(filepathArray[0]);

  if (lastIndexOfTopDirName === 0) {
    return filepath;
  }

  const dedupedPathArray = filepathArray.filter(
    (_, index) => index >= lastIndexOfTopDirName
  );

  return dedupedPathArray.join(path.sep);
}

/**
 * @typedef {Object} ProcessCoverageOptions
 * @property {string} root - Project root directory
 * @property {Function} [pathAdjuster] - Custom function to adjust paths (for ember-cli namespace mappings)
 */

/**
 * Process remapped coverage data: filter invalid paths, normalize GJS/GTS, check existence.
 * Returns an array of coverage entries ready to add to a coverage map.
 *
 * @param {Object} remappedData - Source-map remapped coverage data
 * @param {ProcessCoverageOptions} options
 * @returns {FilteredCoverageEntry[]}
 */
function filterAndNormalizeCoverage(remappedData, options) {
  const { root, pathAdjuster } = options;
  const results = [];

  if (!remappedData || typeof remappedData !== 'object') {
    return results;
  }

  for (const [, fileCov] of Object.entries(remappedData)) {
    const data = fileCov.data ?? fileCov;
    if (!data || !data.path) {
      continue;
    }

    if (isVirtualModule(data.path)) {
      continue;
    }

    let relativePath;

    if (pathAdjuster) {
      relativePath = pathAdjuster(data.path);
      if (relativePath === null) {
        continue;
      }
    } else {
      relativePath = path.relative(root, data.path);
    }

    if (shouldExcludePath(relativePath)) {
      continue;
    }

    if (isGjsGtsFile(relativePath)) {
      relativePath = normalizePathForTemplateImports(relativePath);
    }

    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    results.push({ relativePath, data });
  }

  return results;
}

/**
 * Process raw coverage data through source map remapping and filtering.
 *
 * @param {Object} rawCoverage - Raw coverage data from browser
 * @param {import('istanbul-lib-source-maps').MapStore} sourceMapStore
 * @param {import('istanbul-lib-coverage').CoverageMap} coverageMap
 * @param {ProcessCoverageOptions} options
 */
async function processAndStoreCoverage(
  rawCoverage,
  sourceMapStore,
  coverageMap,
  options
) {
  const libCoverage = require('istanbul-lib-coverage');
  const rawMap = libCoverage.createCoverageMap(rawCoverage);

  const remappedCoverage = await sourceMapStore.transformCoverage(rawMap);
  const remappedData = remappedCoverage.data ?? remappedCoverage;

  const entries = filterAndNormalizeCoverage(remappedData, options);

  for (const { relativePath, data } of entries) {
    data.path = relativePath;
    coverageMap.addFileCoverage(data);
  }
}

module.exports = {
  isVirtualModule,
  shouldExcludePath,
  isGjsGtsFile,
  normalizePathForTemplateImports,
  filterAndNormalizeCoverage,
  processAndStoreCoverage,
};
