'use strict';

var Filter = require('broccoli-filter');
var Istanbul = require('istanbul');
var pathFixer = require('./path-fixer');

CoverageInstrumenter.prototype = Object.create(Filter.prototype);
CoverageInstrumenter.prototype.constructor = CoverageInstrumenter;
function CoverageInstrumenter(inputNode, options) {
  options = options || {};
  this._app = options.app;
  Filter.call(this, inputNode, {
    annotation: options.annotation
  });
}

CoverageInstrumenter.prototype.extensions = ['js'];
CoverageInstrumenter.prototype.targetExtension = 'js';

CoverageInstrumenter.prototype.processString = function(content, relativePath) {
  var instrumenter = new Istanbul.Instrumenter({
    embedSource: true,
    esModules: true,
    noAutoWrap: true
  });

  // fixes the path so the lcov.info can be read by 3rd parties (like coveralls)
  relativePath = pathFixer.fixPath(relativePath, this._app);

  return instrumenter.instrumentSync(content, relativePath);
};

module.exports = CoverageInstrumenter;
