'use strict';

const bodyParserModule = require('body-parser');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');
const libSourceMaps = require('istanbul-lib-source-maps');
const { loadConfig } = require('../istanbul/config.js');
const { createReport } = require('../istanbul/reports.js');
const {
  normalizePathForTemplateImports,
  processAndStoreCoverage,
} = require('./utils.js');

const bodyParser = bodyParserModule.json({ limit: '500mb' });
const sourceMapStore = libSourceMaps.createSourceMapStore();
const WRITE_COVERAGE = '/write-coverage';

/**
 * @typedef {Object} MiddlewareConfig
 * @property {string} root
 * @property {string} configPath
 * @property {Map<string, string>} namespaceMappings
 */

/**
 * Log error to console
 * @param {Error} err
 * @param {any} _req
 * @param {any} _res
 * @param {Function} next
 */
function logError(err, _req, _res, next) {
  console.error(err.stack);
  next(err);
}

/**
 * This function normalizes the relativePath to match what we get from a classical app.
 * Its goal is to change any in repo paths like: app-namespace/lib/in-repo-namespace/components/foo.js
 * to in-repo-namespace/components/foo.js.
 * @param {string} root
 * @param {string} filepath
 * @returns {string}
 */
function normalizeRelativePath(root, filepath) {
  let relativePath;
  const embroiderCompatLT31TmpPathRegex = /embroider\/.{6}/gm;
  const embroiderCompatGT31TmpPathRegex = /\.embroider\/rewritten-app\//gm;

  if (embroiderCompatGT31TmpPathRegex.test(filepath)) {
    relativePath = filepath.split(embroiderCompatGT31TmpPathRegex)[1];
  } else {
    relativePath = filepath.split(embroiderCompatLT31TmpPathRegex)[1].slice(1);
  }

  if (fs.existsSync(path.join(root, 'package.json'))) {
    const pkgJSON = fs.readJsonSync(path.join(root, 'package.json'));
    const inRepoPaths =
      (pkgJSON['ember-addon'] && pkgJSON['ember-addon']['paths']) || [];

    for (let i = 0; i <= inRepoPaths.length; i++) {
      const inRepoPathRegex = new RegExp('[^/]+/' + inRepoPaths[i], 'gi');
      if (inRepoPathRegex.test(relativePath)) {
        relativePath = path.join(
          inRepoPaths[i].split(path.sep).slice(-1)[0],
          filepath.split(inRepoPaths[i])[1]
        );
        break;
      } else if (relativePath.startsWith(inRepoPaths[i])) {
        relativePath = path.join(
          inRepoPaths[i].split(path.sep).slice(-1)[0],
          filepath.split(inRepoPaths[i])[1]
        );
        break;
      }
    }
  }

  return relativePath;
}

/**
 * The objective of this function is to convert an absolute path into a path relative to project root.
 * @param {string} root
 * @param {string} filepath
 * @param {Map<string, string>} namespaceMappings
 * @param {Function} [modifyAssetLocation]
 * @returns {string}
 */
function adjustCoverageKey(
  root,
  filepath,
  namespaceMappings,
  modifyAssetLocation
) {
  const embroiderTmpPathRegex = /embroider\/.{6}/gm;
  const gjsGtsRegex = /\.g[tj]s$/gm;

  let relativePath = path.relative(root, filepath);

  if (embroiderTmpPathRegex.test(filepath)) {
    relativePath = normalizeRelativePath(root, filepath);
  } else if (relativePath.startsWith('..')) {
    return filepath;
  }

  if (gjsGtsRegex.test(relativePath)) {
    relativePath = normalizePathForTemplateImports(relativePath);
  }

  let namespace;
  let pathWithoutNamespace;

  if (relativePath.startsWith('@')) {
    namespace = relativePath.split(path.sep).slice(0, 2).join('/');
    pathWithoutNamespace = relativePath.split(path.sep).slice(2);
  } else {
    namespace = relativePath.split(path.sep)[0];
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
      namespaceMappings
    );

    if (customPath) {
      return customPath;
    }
  }

  if (namespaceMappings.has(namespaceKey)) {
    return path.join(
      ...[namespaceMappings.get(namespaceKey), ...pathWithoutNamespace]
    );
  }

  namespaceKey = '/';
  return path.join(namespaceMappings.get(namespaceKey), relativePath);
}

/**
 * Adjust coverage paths
 * @param {Object.<string, any>} coverage
 * @param {MiddlewareConfig & {configPath: string}} options
 * @returns {Object.<string, any>}
 */
function adjustCoverage(coverage, options) {
  const { root, namespaceMappings, configPath } = options;
  const { modifyAssetLocation } = loadConfig(configPath);

  const adjustedCoverage = Object.keys(coverage).reduce((memo, filePath) => {
    const relativeToProjectRoot = adjustCoverageKey(
      root,
      filePath,
      namespaceMappings,
      modifyAssetLocation
    );
    coverage[filePath].data.path = path.relative(root, relativeToProjectRoot);
    memo[path.relative(root, relativeToProjectRoot)] = coverage[filePath].data;
    return memo;
  }, {});

  return adjustedCoverage;
}

/**
 * Create a path adjuster function for ember-cli middleware.
 * Returns null if the path should be excluded.
 * @param {MiddlewareConfig & {configPath: string}} options
 * @returns {(filepath: string) => string|null}
 */
function createEmberPathAdjuster(options) {
  const { root, namespaceMappings, configPath } = options;
  const { modifyAssetLocation } = loadConfig(configPath);

  return function adjustPath(filepath) {
    const adjusted = adjustCoverageKey(
      root,
      filepath,
      namespaceMappings,
      modifyAssetLocation
    );
    const relativePath = path.relative(root, adjusted);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return null;
    }

    return relativePath;
  };
}

/**
 * Generate coverage reports
 * @param {import('istanbul-lib-coverage').CoverageMap} map
 * @param {string} root
 * @param {string} configPath
 */
function reportCoverage(map, root, configPath) {
  const config = loadConfig(configPath);
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

  // create a context for report generation
  const context = libReport.createContext({
    dir: path.join(root, config.coverageFolder),
    watermarks: libReport.getDefaultWatermarks(),
    coverageMap: map,
  });

  reporters.forEach((reporter) => {
    const report = createReport(reporter);

    // call execute to synchronously create and write the report to disk
    report.execute(context);
  });
}

/**
 * Handle coverage request
 * @param {import('istanbul-lib-coverage').CoverageMap} map
 * @param {MiddlewareConfig & {configPath: string}} options
 * @param {any} req
 * @param {any} res
 */
async function coverageHandler(map, options, req, res) {
  const pathAdjuster = createEmberPathAdjuster(options);

  await processAndStoreCoverage(req.body, sourceMapStore, map, {
    root: options.root,
    pathAdjuster,
  });

  reportCoverage(map, options.root, options.configPath);
  res.send(map.getCoverageSummary().toJSON());
}

/**
 * Used when app is in dev mode (`ember serve`).
 * Creates a new coverage map on every request.
 * @param {any} app
 * @param {MiddlewareConfig & {configPath: string}} options
 */
function serverMiddleware(app, options) {
  app.post(
    WRITE_COVERAGE,
    bodyParser,
    (req, res) => {
      const map = libCoverage.createCoverageMap();

      coverageHandler(map, options, req, res);
    },
    logError
  );
}

/**
 * Used when app is in ci mode (`ember test`).
 * Collects the coverage on each request and merges it into the coverage map.
 * @param {any} app
 * @param {MiddlewareConfig & {configPath: string}} options
 */
function testMiddleware(app, options) {
  const map = libCoverage.createCoverageMap();

  app.post(
    WRITE_COVERAGE,
    bodyParser,
    (req, res) => {
      coverageHandler(map, options, req, res);
    },
    logError
  );
}

module.exports = {
  serverMiddleware,
  testMiddleware,
  adjustCoverageKey,
  adjustCoverage,
  normalizeRelativePath,
};
