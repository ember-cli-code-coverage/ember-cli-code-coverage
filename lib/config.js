'use strict';

var path = require('path');
var fs   = require('fs');
var extend = require('extend');

function config(root) {
  var configFile = path.join(root, 'config', 'coverage-config.js');
  if (fs.existsSync(configFile)) {
    return extend({}, require(configFile), defaultConfig());
  } else {
    return defaultConfig();
  }
}

function defaultConfig() {
  return {
    excludes: ['*/mirage/**/*'],
    coverageEnvVar: 'COVERAGE',
    reporters: [ 'lcov', 'html' ]
  };
}

module.exports = config;
