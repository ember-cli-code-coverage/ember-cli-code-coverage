'use strict';

var bodyParser = require('body-parser');
var istanbul = require('istanbul-api');
var getConfig = require('./config');
var path = require('path');
var crypto = require('crypto');

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function fixFilePaths(coverageData, fileLookup) {
  coverageData.path = fileLookup[coverageData.path];
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
      if (config.coverageFolder) {
        reporter.dir = path.join(options.root, config.coverageFolder);
      }
      let map = istanbul.libCoverage.createCoverageMap();
      let coverage = req.body;

      Object.keys(options.fileLookup).forEach(filename => {
        let fileCoverage = coverage[filename] || istanbul.libCoverage.createFileCoverage(filename).data;
        map.addFileCoverage(fixFilePaths(fileCoverage, options.fileLookup));
      });

      reporter.addAll(config.reporters);
      reporter.write(map);

      const results = map.getCoverageSummary();
      res.send(results);
    },
    logError);
};
