/**
 * @typedef {Object} Configuration
 * @property {String} coverageEnvVar - name of environment variable for coverage
 * @property {String} coverageFolder - directory in which to write coverage to
 * @property {Array<String>} excludes - list of glob paths to exclude
 * @property {Array<String>} reporters - list of reporters
 */

'use strict';

var extend = require('extend');
var fs = require('fs');
var path = require('path');

/**
 * Get configuration for a project, falling back to default configuration if
 * project does not provide a configuration of its own
 * @param {String} root - root path of project
 * @returns {Configuration} configuration to use for project
 */
function config(root) {
  var configFile = path.join(root, 'config', 'coverage.js');
  var defaultConfig = getDefaultConfig();

  var packageJson = require(path.join(root, 'package.json'));
  var isAddon = packageJson.keywords && packageJson.keywords.indexOf('ember-addon') > -1;

  if (isAddon) {
    defaultConfig = extend({}, defaultConfig, {
      addonName: packageJson.name
    });
  }

  if (fs.existsSync(configFile)) {
    var projectConfig = require(configFile);
    return extend({}, defaultConfig, projectConfig);
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
    excludes: [
      '*/mirage/**/*'
    ],
    useBabelInstrumenter: false,
    reporters: [
      'html',
      'lcov'
    ]
  };
}

module.exports = config;
