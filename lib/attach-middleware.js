var bodyParser = require('body-parser');
var Istanbul = require('istanbul');
var config = require('./config');
var path = require('path');
var fs = require('fs-extra');
var crypto = require('crypto');

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

module.exports = function(app, options) {
  app.post('/write-coverage',
    bodyParser.json({ limit: '50mb' }),
    function(req, res) {
      var collector = new Istanbul.Collector();
      var _config = config(options.configPath);

      if (_config.parallel) {
        _config.coverageFolder = _config.coverageFolder + '_' + crypto.randomBytes(4).toString('hex');
        if (_config.reporters.indexOf('json') === -1) {
          _config.reporters.push('json');
        }
      }

      var reporter = new Istanbul.Reporter(null, path.join(options.root, _config.coverageFolder));
      var sync = true;

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
