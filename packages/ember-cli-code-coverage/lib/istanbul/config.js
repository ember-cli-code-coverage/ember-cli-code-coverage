'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} CoverageConfig
 * @property {string} coverageEnvVar - name of environment variable for coverage
 * @property {string} coverageFolder - directory in which to write coverage to
 * @property {string[]} excludes - list of glob paths to exclude
 * @property {string[]} reporters - list of reporters
 * @property {boolean} [parallel]
 * @property {boolean} [templateCoverage]
 * @property {string[]} [extension]
 * @property {Function} [modifyAssetLocation]
 */

/**
 * Get default configuration
 * @returns {CoverageConfig}
 */
function getDefaultConfig() {
  return {
    coverageEnvVar: 'COVERAGE',
    coverageFolder: 'coverage',
    excludes: ['*/mirage/**/*'],
    reporters: ['html', 'lcov'],
  };
}

/**
 * Get configuration for a project, falling back to default configuration if
 * project does not provide a configuration of its own
 * @param {string} configPath - The path for the configuration of the project
 * @returns {CoverageConfig}
 */
function loadConfig(configPath) {
  const configDirName = path.dirname(configPath);
  const configFile = path.resolve(path.join(configDirName, 'coverage.js'));
  const defaultConfig = getDefaultConfig();

  if (fs.existsSync(configFile)) {
    const projectConfig = require(configFile);
    return Object.assign({}, defaultConfig, projectConfig);
  }

  return defaultConfig;
}

module.exports = { loadConfig, getDefaultConfig };
