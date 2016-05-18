'use strict';

var Filter = require('broccoli-filter');
var Instrumenter = require('./babel-istanbul-instrumenter');
var fs = require('fs');
var path = require('path');

function getPathForRealFile(relativePath, root) {
  try {
    fs.statSync(path.join(root, relativePath))
    return relativePath
  } catch (err) {
    try {
      var templatePath = relativePath.replace('.js', '.hbs')
      fs.statSync(path.join(root, templatePath))
      return templatePath
    } catch (err) {
      return null
    }
  }
}

function fixPath(relativePath, name, root) {
  // Handle apps (served from app name)
  if (relativePath.indexOf(name) === 0) {
    relativePath = relativePath.replace(name, 'app')
    return getPathForRealFile(relativePath, root) || relativePath
  }

  // Handle addons (served from dummy app)
  if (relativePath.indexOf('dummy') === 0) {
    relativePath = relativePath.replace('dummy', 'app')
    var dummyPath = path.join('tests', 'dummy', relativePath)
    return (
      getPathForRealFile(dummyPath, root) ||
      getPathForRealFile(relativePath, root) ||
      relativePath
    )
  }

  return relativePath
}

CoverageInstrumenter.prototype = Object.create(Filter.prototype);
CoverageInstrumenter.prototype.constructor = CoverageInstrumenter;
function CoverageInstrumenter(inputNode, options) {
  options = options || {};
  this._appName = options.appName;
  this._appRoot = options.appRoot;
  Filter.call(this, inputNode, {
    annotation: options.annotation
  });
}

CoverageInstrumenter.prototype.extensions = ['js'];
CoverageInstrumenter.prototype.targetExtension = 'js';

CoverageInstrumenter.prototype.processString = function(content, relativePath) {
  var instrumenter = new Instrumenter({
    babel: {
      blacklist: ['es6.modules'],
      nonStandard: false,
      optional: ['es7.decorators']
    },
    embedSource: true,
    noAutoWrap: true
  });

  relativePath = fixPath(relativePath, this._appName, this._appRoot);

  return instrumenter.instrumentSync(content, relativePath);
};

module.exports = CoverageInstrumenter;
