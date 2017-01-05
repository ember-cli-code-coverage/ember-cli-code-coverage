'use strict';

var path = require('path');
var Istanbul = require('istanbul');
var config = require('./config');
var dir = require('node-dir');
var Promise = require('rsvp').Promise;

/**
 * Merge together coverage files created when running in multiple threads,
 * for example when being used with ember exam and parallel runs.
 */
module.exports = {
  name: 'coverage-merge',
  description: 'Merge multiple coverage files together.',
  run: function () {
    var collector = new Istanbul.Collector();
    var _config = this._getConfig();
    var projectRoot = this.project.root;
    var reporter = new Istanbul.Reporter(null, path.join(projectRoot, _config.coverageFolder));
    var coverageDirRegex = new RegExp(_config.coverageFolder + '_.*');

    return new Promise(function (resolve, reject) {
      dir.readFiles(projectRoot, {matchDir: coverageDirRegex, match: /coverage-final\.json/},
        function (err, coverageSummary, next) {
          if (err) {
            reject(err);
          }
          collector.add(JSON.parse(coverageSummary));
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
    return config(this.project.root);
  }
};
