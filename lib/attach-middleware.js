'use strict';

const bodyParser = require('body-parser').json({ limit: '50mb' });
const istanbul = require('istanbul-api');
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
    let fileCoverage =
      fixedCoverage[filename] || istanbul.libCoverage.createFileCoverage(filename).data;
    map.addFileCoverage(fixFilePaths(fileCoverage, fileLookup));
  });
}

function reportCoverage(map, root, configPath) {
  let config = getConfig(configPath);
  let reporter = istanbul.createReporter();
  if (config.parallel) {
    config.coverageFolder = config.coverageFolder + '_' + crypto.randomBytes(4).toString('hex');
    if (config.reporters.indexOf('json') === -1) {
      config.reporters.push('json');
    }
  }
  if (config.reporters.indexOf('json-summary') === -1) {
    config.reporters.push('json-summary');
  }
  if (config.coverageFolder) {
    reporter.dir = path.join(root, config.coverageFolder);
  }
  reporter.addAll(config.reporters);
  reporter.write(map);
}

function coverageHandler(map, options, req, res) {
  writeCoverage(req.body, options.fileLookup, options.root, map);
  reportCoverage(map, options.root, options.configPath);
  res.send(map.getCoverageSummary().toJSON());
}

// Used when app is in dev mode (`ember serve`).
// Creates a new coverage map on every request.
const serverMiddleware = function (app, options) {
  app.post(
    WRITE_COVERAGE,
    bodyParser,
    (req, res) => {
      let map = istanbul.libCoverage.createCoverageMap();
      coverageHandler(map, options, req, res);
    },
    logError
  );
};

// Used when app is in ci mode (`ember test`).
// Collects the coverage on each request and merges it into the coverage map.
const testMiddleware = function (app, options) {
  let map = istanbul.libCoverage.createCoverageMap();
  app.post(WRITE_COVERAGE, bodyParser, coverageHandler.bind(null, map, options), logError);
};

module.exports = {
  serverMiddleware,
  testMiddleware,
};
