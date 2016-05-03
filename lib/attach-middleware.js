'use strict';

var bodyParser = require('body-parser');
var Istanbul = require('istanbul');
var config = require('./config');

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}
module.exports = function(app, options) {
  app.post('/write-coverage',
    bodyParser.json({ limit: '50mb' }),
    function(req, res) {
      var collector = new Istanbul.Collector();
      var reporter = new Istanbul.Reporter(null, options.root + '/coverage');
      var sync = false;
      var _config = config(options.root);
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
