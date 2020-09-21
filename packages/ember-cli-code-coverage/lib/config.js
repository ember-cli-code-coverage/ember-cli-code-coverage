'use strict';

/**
 * @typedef {Object} Configuration
 * @property {String} coverageEnvVar - name of environment variable for coverage
 * @property {String} coverageFolder - directory in which to write coverage to
 * @property {Array<String>} excludes - list of glob paths to exclude
 * @property {Array<String>} reporters - list of reporters
 */

var fs = require('fs');
var path = require('path');

/**
 * Get configuration for a project, falling back to default configuration if
 * project does not provide a configuration of its own
 * @param {String} configPath - The path for the configuration of the project
 * @returns {Configuration} configuration to use for project
 */
function config(configPath) {
  var configDirName = path.dirname(configPath);
  var configFile = path.resolve(path.join(configDirName, 'coverage.js'));
  var defaultConfig = getDefaultConfig();

  if (fs.existsSync(configFile)) {
    var projectConfig = require(configFile);
    return Object.assign({}, defaultConfig, projectConfig);
  }

  return defaultConfig;
}

/**
 * Get default configuration
 * @returns {Configuration} default configuration
 */
function getDefaultConfig() {
  return {
    coverageEnvVar: 'COVERAGE',
    coverageFolder: 'coverage',
    excludes: ['*/mirage/**/*'],
    reporters: ['html', 'lcov'],
  };
}

module.exports = config;
