'use strict';

const path = require('path');
const getConfig = require('./config');
const dir = require('node-dir');

/**
 * Merge together coverage files created when running in multiple threads,
 * for example when being used with ember exam and parallel runs.
 */
module.exports = {
  name: 'coverage-merge',
  description: 'Merge multiple coverage files together.',

  run() {
    const libCoverage = require('istanbul-lib-coverage');
    const libReport = require('istanbul-lib-report');
    const reports = require('istanbul-reports');

    let config = this._getConfig();

    let coverageFolderSplit = config.coverageFolder.split('/');
    let coverageFolder = coverageFolderSplit.pop();
    let coverageRoot = this.project.root + '/' + coverageFolderSplit.join('/');
    let coverageDirRegex = new RegExp(coverageFolder + '_.*');

    let map = libCoverage.createCoverageMap();

    return new Promise(function (resolve, reject) {
      dir.readFiles(
        coverageRoot,
        { matchDir: coverageDirRegex, match: /coverage-final\.json/ },
        function (err, coverageSummary, next) {
          if (err) {
            reject(err);
          }
          map.merge(JSON.parse(coverageSummary));
          next();
        },
        function (err) {
          if (err) {
            reject(err);
          }

          let { reporters } = config;

          if (!reporters.includes('json-summary')) {
            reporters.push('json-summary');
          }

          // create a context for report generation
          let context = libReport.createContext({
            dir: path.join(coverageRoot, coverageFolder),
            watermarks: libReport.getDefaultWatermarks(),
            coverageMap: map,
          });

          reporters.forEach(reporter => {
            let report = reports.create(reporter, {});

            // call execute to synchronously create and write the report to disk
            report.execute(context);
          });

          resolve();
        }
      );
    });
  },

  /**
   * Get project configuration
   * @returns {Configuration} project configuration
   */
  _getConfig() {
    return getConfig(this.project.configPath());
  },
};
