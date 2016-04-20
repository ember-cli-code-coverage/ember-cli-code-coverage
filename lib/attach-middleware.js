'use strict';

var bodyParser = require('body-parser');
var Istanbul = require('istanbul');

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
      collector.add(req.body);
      reporter.addAll([ 'lcov', 'html', 'json-summary' ]);    // TODO make configurable
      reporter.write(collector, sync, function() {});
      res.send('Coverage info received');   // TODO: send json results to browser?
    },
    logError);
};
