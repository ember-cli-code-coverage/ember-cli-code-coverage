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

  app.get('/get-module-name',
    function(req, res) {
      res.send({ appName: options.appName })
    })

  app.post('/should-exclude',bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }),bodyParser.json({
    limit: '50mb'
  }),
    function(req, res) {
      for (var i = 0; i < options.excludes.length; i++) {
        if (minimatch(req.body.moduleName, options.excludes[i])) {
          res.send({result: true})
          return
        }
      }
      res.send({result: false})
    })
};
