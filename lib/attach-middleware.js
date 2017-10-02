'use strict';

var bodyParser = require('body-parser');
var istanbul = require('istanbul-api');
var getConfig = require('./config');
var crypto = require('crypto');

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function fixFilePaths(coverageData) {
  // TODO: munge `coverageData.path` to the "real" on disk paths
  // so that tools like code-climate (and other coverage related things)
  // work properly
  return coverageData;
}

module.exports = function(app, options) {
  app.post('/write-coverage',
    bodyParser.json({ limit: '50mb' }),
    function(req, res) {
      var config = getConfig(options.configPath);

      if (config.parallel) {
        config.coverageFolder = config.coverageFolder + '_' + crypto.randomBytes(4).toString('hex');
        if (config.reporters.indexOf('json') === -1) {
          config.reporters.push('json');
        }
      }

      if (config.reporters.indexOf('json-summary') === -1) {
        config.reporters.push('json-summary');
      }

      let reporter = istanbul.createReporter();
      let map = istanbul.libCoverage.createCoverageMap();
      let coverage = req.body;

      Object.keys(coverage).forEach(filename =>
        map.addFileCoverage(fixFilePaths(coverage[filename]))
      );

      reporter.addAll(config.reporters);
      reporter.write(map);

      const results = map.getCoverageSummary();
      res.send(results);
    },
    logError);
};
