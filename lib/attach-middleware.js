'use strict';

var bodyParser = require('body-parser');
var Istanbul = require('istanbul');
var config = require('./config');
var path = require('path');

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
        res.send('Coverage info received');   // TODO: send json results to browser?
      });
    },
    logError);
};
