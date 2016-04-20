'use strict';

var Filter = require('broccoli-filter');
var Istanbul = require('istanbul');

CoverageInstrumenter.prototype = Object.create(Filter.prototype);
CoverageInstrumenter.prototype.constructor = CoverageInstrumenter;
function CoverageInstrumenter(inputNode, options) {
  options = options || {};
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

  return instrumenter.instrumentSync(content, relativePath);
};

module.exports = CoverageInstrumenter;
