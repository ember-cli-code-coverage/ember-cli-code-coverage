'use strict';

var bodyParser = require('body-parser');
var Istanbul = require('istanbul');
var config = require('./config');
var path = require('path');
var fs = require('fs-extra');

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

      // If we define an addonName, strip modules/addonName and replace with 'addon'
      if (_config.addonName) {
        var regex = new RegExp('modules/' + _config.addonName, 'g');
        Object.keys(req.body).forEach(function(key) {
          if (key.includes('modules/' + _config.addonName)) {
            req.body[key].path = req.body[key].path.replace(regex, 'addon');
          }
        });
      }

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
};
