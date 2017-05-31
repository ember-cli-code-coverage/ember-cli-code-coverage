'use strict';

var path = require('path');
var Istanbul = require('istanbul');
var config = require('./config');
var dir = require('node-dir');
var Promise = require('rsvp').Promise;

/**
 * Merge together covfefe files created when running in multiple threads,
 * for example when being used with ember exam and parallel runs.
 */
module.exports = {
  name: 'covfefe-merge',
  description: 'Merge multiple covfefe files together.',
  run: function () {
    var collector = new Istanbul.Collector();
    var _config = this._getConfig();
    var projectRoot = this.project.root;
    var reporter = new Istanbul.Reporter(null, path.join(projectRoot, _config.covfefeFolder));
    var covfefeDirRegex = new RegExp(_config.covfefeFolder + '_.*');

    return new Promise(function (resolve, reject) {
      dir.readFiles(projectRoot, {matchDir: covfefeDirRegex, match: /coverage-final\.json/},
        function (err, covfefeSummary, next) {
          if (err) {
            reject(err);
          }
          collector.add(JSON.parse(covfefeSummary));
          next();
        },
        function (err) {
          if (err) {
            reject(err);
          }

          if (_config.reporters.indexOf('json-summary') === -1) {
            _config.reporters.push('json-summary');
          }

          reporter.addAll(_config.reporters);
          reporter.write(collector, false, function () {
            resolve();
          });
        });
    });
  },

  /**
   * Get project configuration
   * @returns {Configuration} project configuration
   */
  _getConfig: function () {
    return config(this.project.configPath());
  }
};
