'use strict';

const bodyParser = require('body-parser').json({ limit: '50mb' });
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const getConfig = require('./config');
const path = require('path');
const crypto = require('crypto');

const WRITE_COVERAGE = '/write-coverage';

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function fixFilePaths(coverageData, fileLookup) {
  coverageData.path = fileLookup[coverageData.path];
  return coverageData;
}

function writeCoverage(coverage, fileLookup, root, map) {
  // Convert absolute paths (path to process.cwd + module path) to relative (module) paths, when necessary (babel >6)
  // eg. /Users/user/apps/my-ember-app/my-ember-app/app.js => my-ember-app/app.js
  const fixedCoverage = Object.keys(coverage).reduce((memo, filePath) => {
    const modulePath = path.relative(root, filePath).split(path.sep).join('/');
    memo[modulePath] = Object.assign({}, coverage[filePath], { path: modulePath });
    return memo;
  }, {});

  Object.keys(fileLookup).forEach(filename => {
    let fileCoverage = fixedCoverage[filename] || libCoverage.createFileCoverage(filename).data;
    map.addFileCoverage(fixFilePaths(fileCoverage, fileLookup));
  });
}

function reportCoverage(map, root, configPath) {
  let config = getConfig(configPath);

  let { reporters } = config;

  if (config.parallel) {
    config.coverageFolder = config.coverageFolder + '_' + crypto.randomBytes(4).toString('hex');

    if (!reporters.includes('json')) {
      reporters.push('json');
    }
  }

  if (!reporters.includes('json-summary')) {
    reporters.push('json-summary');
  }

  // create a context for report generation
  let context = libReport.createContext({
    dir: path.join(root, config.coverageFolder),
    watermarks: libReport.getDefaultWatermarks(),
    coverageMap: map,
  });

  reporters.forEach(reporter => {
    let report = reports.create(reporter, {});

    // call execute to synchronously create and write the report to disk
    report.execute(context);
  });
}

function coverageHandler(map, options, req, res) {
  writeCoverage(req.body, options.fileLookup, options.root, map);
  reportCoverage(map, options.root, options.configPath);

  res.send(map.getCoverageSummary().toJSON());
}

// Used when app is in dev mode (`ember serve`).
// Creates a new coverage map on every request.
function serverMiddleware(app, options) {
  app.post(
    WRITE_COVERAGE,
    bodyParser,
    (req, res) => {
      let map = libCoverage.createCoverageMap();

      coverageHandler(map, options, req, res);
    },
    logError
  );
}

// Used when app is in ci mode (`ember test`).
// Collects the coverage on each request and merges it into the coverage map.
function testMiddleware(app, options) {
  let map = libCoverage.createCoverageMap();

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
};
