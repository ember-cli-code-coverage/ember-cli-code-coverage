'use strict';

var bodyParser = require('body-parser');
var Istanbul = require('istanbul');
var config = require('./config');
var path = require('path');
var fs = require('fs-extra');
var minimatch = require('minimatch')
function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

module.exports = function(app, options) {
  app.post('/write-coverage',
    bodyParser.json({ limit: '50mb' }),
    function(req, res) {
      var collector = new Istanbul.Collector();
      var _config = config(options.root);
      var reporter = new Istanbul.Reporter(null, path.join(options.root, _config.coverageFolder));
      var sync = false;

      collector.add(req.body);

      if (_config.reporters.indexOf('json-summary') === -1) {
        _config.reporters.push('json-summary');
      }

      reporter.addAll(_config.reporters);
      reporter.write(collector, sync, function() {
        var summaryFilePath = path.join(options.root, _config.coverageFolder, 'coverage-summary.json');
        var results = fs.readJSONSync(summaryFilePath);
        res.send(results);
      });
    },
    logError);

  function shouldExclude(moduleName, excludes) {
    for (var i = 0; i < excludes.length; i++) {
      if (minimatch(moduleName, excludes[i])) {
        return true
      }
    }
    return false
  }
  app.post('/filter-entries',bodyParser.urlencoded({
    limit: options.root.coveragePostLimit ||'50mb',
    extended: false,
    parameterLimit: options.root.coveragePostParameterLimit ||10000
  }),bodyParser.json({
    limit: options.root.coveragePostLimit || '50mb'
  }),
    function(req, res) {
      var entries = req.body['entries[]'] || req.body.entries
      var seen = {}
      var appName = options.appName
      var filteredEntries = entries.filter(function(entry) {
        var result = false
        if (typeof (seen[entry]) === 'undefined') {
          var parts = entry.split('/')
          if (parts.length >= 1 && parts[0] === appName || parts.length >= 2 && parts[0] === 'dummy' && parts[1] === appName) {
            if (!shouldExclude(entry, options.excludes)) {
              result = true
            }
          }
          seen[entry] = true;
          return result
        }
        return result
      })
      res.send({entries: filteredEntries})
    })
};
