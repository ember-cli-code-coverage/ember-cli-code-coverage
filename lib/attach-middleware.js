'use strict';

const bodyParser = require('body-parser').json({ limit: '50mb' });
const istanbul = require('istanbul-api');
const getConfig = require('./config');
const path = require('path');

const WRITE_COVERAGE = '/write-coverage';

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function fixFilePaths(coverageData, fileLookup) {
  coverageData.path = fileLookup[coverageData.path];
  return coverageData;
}

function writeCoverage(coverage, fileLookup, map) {
  Object.keys(fileLookup).forEach(filename => {
    let fileCoverage = coverage[filename] || istanbul.libCoverage.createFileCoverage(filename).data;
    map.addFileCoverage(fixFilePaths(fileCoverage, fileLookup));
  });
}

function reportCoverage(map, root, configPath) {
  let config = getConfig(configPath);
  let reporter = istanbul.createReporter();
  if (config.coverageFolder) {
    reporter.dir = path.join(root, config.coverageFolder);
  }
  reporter.addAll(config.reporters);
  reporter.write(map);
}

function coverageHandler(map, options, req, res) {
  writeCoverage(req.body, options.fileLookup, map);
  reportCoverage(map, options.root, options.configPath);
  res.send(map.getCoverageSummary());
}

// Used when app is in dev mode (`ember serve`).
// Creates a new coverage map on every request.
const attachServerMiddleware = function(app, options) {
  app.post(WRITE_COVERAGE,
    bodyParser,
    (...args) => {
      let map = istanbul.libCoverage.createCoverageMap();
      coverageHandler(map, options, ...args);
    },
    logError);
};

// Used when app is in ci mode (`ember test`).
// Collects the coverage on each request and merges it into the coverage map.
const attachTestMiddleware = function(app, options) {
  let map = istanbul.libCoverage.createCoverageMap();
  app.post(WRITE_COVERAGE,
    bodyParser,
    coverageHandler.bind(null, map, options),
    logError);
};

module.exports = {
  attachServerMiddleware,
  attachTestMiddleware,
};
