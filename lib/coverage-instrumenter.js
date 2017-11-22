'use strict';

require('string.prototype.startswith');
var existsSync = require('exists-sync');
var Filter = require('broccoli-filter');
var BabelInstrumenter = require('./babel-istanbul-instrumenter');
var Instrumenter = require('istanbul').Instrumenter;
var path = require('path');

function getPathForRealFile(relativePath, root, extensions) {
  if (existsSync(path.join(root, relativePath))) {
    return relativePath
  }

  for (var i = 0, len = extensions.length; i < len; i++) {
    var extension = extensions[i];
    var templatePath = relativePath.replace('.js', '.' + extension);

    if (existsSync(templatePath)) {
      return templatePath;
    }
  }

  return null;
}

function fixPath(relativePath, name, root, extensions, isAddon) {
  // Handle addons
  if (isAddon) {
    // Handle addons (served from dummy app)
    if (relativePath.startsWith('dummy')) {
      relativePath = relativePath.replace('dummy', 'app');
      var dummyPath = path.join('tests', 'dummy', relativePath);
      return (
        getPathForRealFile(dummyPath, root, extensions) ||
        getPathForRealFile(relativePath, root, extensions) ||
        relativePath
      );
    }

    // Handle addons renaming of modules/my-addon or my-addon (depending on ember-cli version)
    var regex = new RegExp('^(modules/)?' + name + '/');
    if (regex.test(relativePath)) {
      relativePath = relativePath.replace(regex, 'addon/');
      return (
        getPathForRealFile(relativePath, root, extensions) ||
        relativePath
      );
    }
  } else {
    relativePath = relativePath.replace(name, 'app');
    return getPathForRealFile(relativePath, root, extensions) || relativePath;
  }

  return relativePath;
}

CoverageInstrumenter.prototype = Object.create(Filter.prototype);
CoverageInstrumenter.prototype.constructor = CoverageInstrumenter;
function CoverageInstrumenter(inputNode, options) {
  options = options || {};

  this._appName = options.appName;
  this._appRoot = options.appRoot;
  this._isAddon = options.isAddon;
  this._useBabelInstrumenter = options.useBabelInstrumenter;
  this._babelPlugins = options.babelPlugins;

  this._babelOptions = options.babelOptions || {};

  // The presence of the following babel options cause tests to fail so let's
  // simply remove them from the babel config
  [
    'compileModules',
    'resolveModuleSource',
    'includePolyfill'
  ].forEach(function(key) {
    delete this._babelOptions[key];
  }.bind(this));

  this._preCompiledExtensions = options.preCompiledExtensions;

  Filter.call(this, inputNode, {
    annotation: options.annotation
  });
}

CoverageInstrumenter.prototype.extensions = ['js'];
CoverageInstrumenter.prototype.targetExtension = 'js';

CoverageInstrumenter.prototype.processString = function(content, relativePath) {
  var instrumenter;

  if (this._useBabelInstrumenter) {
    instrumenter = new BabelInstrumenter({
      babel: this._babelOptions,
      plugins: this._babelPlugins,
      embedSource: true,
      noAutoWrap: true
    });
  } else {
    instrumenter = new Instrumenter({
      embedSource: true,
      esModules: true,
      noAutoWrap: true
    });
  }

  relativePath = fixPath(relativePath, this._appName, this._appRoot, this._preCompiledExtensions, this._isAddon);

  try {
    return instrumenter.instrumentSync(content, relativePath);
  } catch (e) {
    console.error('Unable to cover:', relativePath, '. Newer JS features may need Babel instrumentation to work. Try setting useBabelInstrumenter to true in your config/coverage.js.\n', e.stack);
  }
};

module.exports = CoverageInstrumenter;
