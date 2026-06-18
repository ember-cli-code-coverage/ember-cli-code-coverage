'use strict';

const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const libSourceMaps = require('istanbul-lib-source-maps');

const { loadConfig, getDefaultConfig } = require('./config.js');
const { createReport } = require('./reports.js');
const { createCoverageMergeCommand } = require('./merge.js');

/**
 * Create a coverage map
 * @param {Object} [data] - Initial coverage data
 * @returns {import('istanbul-lib-coverage').CoverageMap}
 */
function createCoverageMap(data) {
  return data
    ? libCoverage.createCoverageMap(data)
    : libCoverage.createCoverageMap();
}

/**
 * Create a source map store
 * @returns {import('istanbul-lib-source-maps').MapStore}
 */
function createSourceMapStore() {
  return libSourceMaps.createSourceMapStore();
}

/**
 * Transform coverage data using source maps
 * @param {import('istanbul-lib-coverage').CoverageMap} coverage
 * @param {import('istanbul-lib-source-maps').MapStore} [sourceMapStore]
 * @returns {Promise<import('istanbul-lib-coverage').CoverageMap>}
 */
async function transformCoverageWithSourceMaps(coverage, sourceMapStore) {
  const store = sourceMapStore ?? libSourceMaps.createSourceMapStore();
  return store.transformCoverage(coverage);
}

/**
 * Generate coverage reports
 * @param {import('istanbul-lib-coverage').CoverageMap} coverageMap
 * @param {Object} options
 * @param {string} options.dir - Output directory
 * @param {(string | [string, object])[]} options.reporters - List of reporters
 */
function generateReports(coverageMap, options) {
  const context = libReport.createContext({
    dir: options.dir,
    watermarks: libReport.getDefaultWatermarks(),
    coverageMap,
  });

  options.reporters.forEach((reporter) => {
    const report = createReport(reporter);
    report.execute(context);
  });
}

/**
 * Merge multiple coverage maps into one
 * @param {import('istanbul-lib-coverage').CoverageMap[]} maps
 * @returns {import('istanbul-lib-coverage').CoverageMap}
 */
function mergeCoverageMaps(maps) {
  const merged = libCoverage.createCoverageMap();
  for (const map of maps) {
    merged.merge(map);
  }
  return merged;
}

module.exports = {
  loadConfig,
  getDefaultConfig,
  createCoverageMap,
  createSourceMapStore,
  transformCoverageWithSourceMaps,
  generateReports,
  mergeCoverageMaps,
  createReport,
  createCoverageMergeCommand,
};
