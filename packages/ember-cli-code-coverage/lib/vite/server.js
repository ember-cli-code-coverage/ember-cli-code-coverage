'use strict';

const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const libSourceMaps = require('istanbul-lib-source-maps');
const path = require('path');
const { getDefaultConfig } = require('../istanbul/config.js');
const { createReport } = require('../istanbul/reports.js');

/**
 * Process coverage data
 * @param {Object} coverageData
 * @param {string} root
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function processCoverage(coverageData, root, options) {
  const sourceMapStore = libSourceMaps.createSourceMapStore();
  const rawMap = libCoverage.createCoverageMap(coverageData);

  const remappedCoverage = await sourceMapStore.transformCoverage(rawMap);
  const map = libCoverage.createCoverageMap();

  const remappedData = remappedCoverage.data ?? remappedCoverage;
  if (remappedData && typeof remappedData === 'object') {
    for (const [, fileCov] of Object.entries(remappedData)) {
      const data = fileCov.data ?? fileCov;
      if (data && data.path) {
        data.path = path.relative(root, data.path);
        map.addFileCoverage(data);
      }
    }
  }

  const coverageConfig = options.coverage ?? {};
  const defaultConfig = getDefaultConfig();

  const reporters = coverageConfig.reporters ?? defaultConfig.reporters;
  const coverageFolder =
    coverageConfig.coverageFolder ?? defaultConfig.coverageFolder;

  if (!reporters.includes('json-summary')) {
    reporters.push('json-summary');
  }

  const context = libReport.createContext({
    dir: path.join(root, coverageFolder),
    watermarks: libReport.getDefaultWatermarks(),
    coverageMap: map,
  });

  reporters.forEach((reporter) => {
    const report = createReport(reporter);
    report.execute(context);
  });

  return map.getCoverageSummary().toJSON();
}

/**
 * Create Vite coverage server plugin
 * @param {Object} [options]
 * @returns {import('vite').Plugin}
 */
function coverageServerPlugin(options = {}) {
  let root = process.cwd();

  return {
    name: 'ember-coverage-server',

    configResolved(config) {
      root = config.root;
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/write-coverage' || req.method !== 'POST') {
          return next();
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const coverageData = JSON.parse(body);
            const result = await processCoverage(coverageData, root, options);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err) {
            console.error(
              'ember-cli-code-coverage: Error processing coverage:',
              err.message
            );
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

module.exports = { coverageServerPlugin };
