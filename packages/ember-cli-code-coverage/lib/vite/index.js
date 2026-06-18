'use strict';

const { instrumentationPlugin } = require('./instrumentation.js');
const { coverageServerPlugin } = require('./server.js');

/**
 * @typedef {Object} VitePluginOptions
 * @property {boolean} [enabled] - Enable coverage (defaults to checking COVERAGE env var)
 * @property {string} [coverageEnvVar] - Environment variable to check for enabling coverage (default: "COVERAGE")
 * @property {string[]} [exclude] - Glob patterns to exclude from instrumentation
 * @property {string[]} [extensions] - File extensions to instrument
 * @property {boolean} [templateCoverage] - Enable template branch coverage (requires /glimmer module)
 * @property {Object} [coverage] - Coverage config overrides
 */

/**
 * Returns an array of Vite plugins for code coverage.
 * Combines instrumentation (transform hook) and coverage server (configureServer hook).
 * @param {VitePluginOptions} [options]
 * @returns {import('vite').Plugin[]}
 */
function coveragePlugin(options = {}) {
  const coverageEnvVar = options.coverageEnvVar ?? 'COVERAGE';
  const enabled = options.enabled ?? process.env[coverageEnvVar] === 'true';

  if (!enabled) {
    return [];
  }

  return [instrumentationPlugin(options), coverageServerPlugin(options)];
}

/**
 * Returns template coverage AST transforms for use in babel.config.cjs.
 * Delegates to the /glimmer module's coverageAstTransform().
 *
 * NOTE: This is currently a stub that returns an empty array.
 * @returns {any[]}
 */
function getTemplateCoverageTransforms() {
  try {
    const { coverageAstTransform } = require('../glimmer/index.js');
    const transform = coverageAstTransform();
    return Array.isArray(transform) ? transform : [transform];
  } catch {
    return [];
  }
}

module.exports = {
  coveragePlugin,
  instrumentationPlugin,
  coverageServerPlugin,
  getTemplateCoverageTransforms,
};
