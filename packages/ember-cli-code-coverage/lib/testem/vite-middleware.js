'use strict';

const path = require('path');
const libCoverage = require('istanbul-lib-coverage');
const libSourceMaps = require('istanbul-lib-source-maps');
const { generateReports, getDefaultConfig } = require('../istanbul/index.js');
const { processAndStoreCoverage } = require('./utils.js');

/**
 * @typedef {Object} ViteTestemMiddlewareOptions
 * @property {string} [root] - Project root directory (defaults to process.cwd())
 * @property {string} [coverageFolder] - Coverage output folder (defaults to 'coverage')
 * @property {string[]} [reporters] - Coverage reporters (defaults to ['html', 'lcov', 'json-summary'])
 */

/**
 * Creates testem middleware for Vite-based projects.
 * This is a simplified middleware for Vite builds that don't use ember-cli.
 *
 * Usage in testem.cjs:
 * ```js
 * const { createViteTestemMiddleware } = require('ember-cli-code-coverage/testem');
 *
 * module.exports = {
 *   middleware: [createViteTestemMiddleware()],
 *   // ... other testem config
 * };
 * ```
 *
 * @param {ViteTestemMiddlewareOptions} [options]
 * @returns {Function} Express middleware function
 */
function createViteTestemMiddleware(options = {}) {
  const root = options.root || process.cwd();
  const defaultConfig = getDefaultConfig();
  const coverageFolder = options.coverageFolder || defaultConfig.coverageFolder;
  const reporters = options.reporters || [
    ...defaultConfig.reporters,
    'json-summary',
  ];

  if (!reporters.includes('json-summary')) {
    reporters.push('json-summary');
  }

  return function coverageMiddleware(app) {
    const sourceMapStore = libSourceMaps.createSourceMapStore();
    const map = libCoverage.createCoverageMap();

    app.post('/write-coverage', async (req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const coverageData = JSON.parse(body);

          await processAndStoreCoverage(coverageData, sourceMapStore, map, {
            root,
          });

          generateReports(map, {
            dir: path.join(root, coverageFolder),
            reporters,
          });

          const summary = map.getCoverageSummary().toJSON();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(summary));
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
  };
}

module.exports = { createViteTestemMiddleware };
