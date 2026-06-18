'use strict';

const path = require('path');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const dir = require('node-dir');
const { loadConfig } = require('./config.js');
const { createReport } = require('./reports.js');

/**
 * Merge together coverage files created when running in multiple threads,
 * for example when being used with ember exam and parallel runs.
 * @returns {Object}
 */
function createCoverageMergeCommand() {
  return {
    name: 'coverage-merge',
    description: 'Merge multiple coverage files together.',

    run() {
      const config = loadConfig(this.project.configPath());
      const coverageFolderSplit = config.coverageFolder.split('/');
      const coverageFolder = coverageFolderSplit.pop();
      const coverageRoot =
        this.project.root + '/' + coverageFolderSplit.join('/');
      const coverageDirRegex = new RegExp(coverageFolder + '_.*');

      const map = libCoverage.createCoverageMap();

      return new Promise((resolve, reject) => {
        dir.readFiles(
          coverageRoot,
          {
            matchDir: coverageDirRegex,
            match: /coverage-final\.json/,
          },
          function (err, coverageSummary, next) {
            if (err) {
              return reject(err);
            }
            map.merge(JSON.parse(coverageSummary.toString()));
            next();
          },
          function (err) {
            if (err) {
              return reject(err);
            }

            const { reporters } = config;

            if (!reporters.includes('json-summary')) {
              reporters.push('json-summary');
            }

            const context = libReport.createContext({
              dir: path.join(coverageRoot, coverageFolder),
              watermarks: libReport.getDefaultWatermarks(),
              coverageMap: map,
            });

            reporters.forEach((reporter) => {
              const report = createReport(reporter);
              report.execute(context);
            });

            resolve();
          }
        );
      });
    },
  };
}

module.exports = { createCoverageMergeCommand };
