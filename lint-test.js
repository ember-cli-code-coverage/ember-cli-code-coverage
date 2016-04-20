'use strict';

var glob = require('glob').sync;

var paths = glob('test/**/*.js').filter(function(path) {
  return !/fixtures/.test(path);
});

paths = paths.concat(glob('lib/**/*.js'), 'index.js');

require('mocha-eslint')(paths);
