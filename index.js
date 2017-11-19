'use strict';

var path = require('path');
var existsSync = require('exists-sync');
var fs = require('fs-extra');
var attachMiddleware = require('./lib/attach-middleware');
var config = require('./lib/config');
var walkSync = require('walk-sync');
const VersionChecker = require('ember-cli-version-checker');

function requireBabelPlugin(pluginName) {
  let plugin = require(pluginName);

  plugin = plugin.__esModule ? plugin.default : plugin;

  // adding `baseDir` ensures that broccoli-babel-transpiler does not
  // issue a warning and opt out of caching
  let pluginPath = require.resolve(`${pluginName}/package`);
  let pluginBaseDir = path.dirname(pluginPath);
  plugin.baseDir = () => pluginBaseDir;

  return plugin;
}

function getPlugins(options) {
  options.babel = options.babel || {};
  return options.babel.plugins = options.babel.plugins || [];
}

const EXT_RE = /\.[^\.]+$/;

module.exports = {
  name: 'ember-cli-code-coverage',

  /**
   * Look up the file path from an ember module path.
   * @type {Object<String, String>}
   */
  fileLookup: null,

  // Ember Methods

  included: function() {
    this._super.included.apply(this, arguments);

    let options;
    this.fileLookup = {};

    if (!this._registeredWithBabel && this._isCoverageEnabled()) {
      let checker = new VersionChecker(this.parent).for('ember-cli-babel', 'npm');

      if (checker.satisfies('>= 6.0.0')) {
        const IstanbulPlugin = requireBabelPlugin('babel-plugin-istanbul');

        const appDir = path.join(this.project.root, 'app');
        if (fs.existsSync(appDir)) {
          // Instrument the app directory.
          let prefix = this.parent.isEmberCLIAddon() ? 'dummy' : this.parent.name();
          options = this.app.options = this.app.options || {};
          getPlugins(options).push([IstanbulPlugin, {
            exclude: this._getExcludes(),
            include: this._getIncludes(appDir, 'app', prefix)
          }]);
        }

        const addonDir = path.join(this.project.root, 'addon');
        if (fs.existsSync(addonDir)) {
          // Instrument the addon directory.
          let addon = this._findCoveredAddon();
          options = addon.options = addon.options || {};
          getPlugins(options).push([IstanbulPlugin, {
            exclude: this._getExcludes(),
            include: this._getIncludes(addonDir, 'addon', addon.name)
          }]);
        }

      } else {
        this.project.ui.writeWarnLine(
          'ember-cli-code-coverage: You are using an unsupported ember-cli-babel version,' +
          'instrumentation will not be available.'
        );
      }

      this._registeredWithBabel = true;
    }
  },

  contentFor: function(type) {
    if (type === 'test-body-footer' && this._isCoverageEnabled()) {
      var template = fs.readFileSync(path.join(__dirname, 'lib', 'templates', 'test-body-footer.html')).toString();
      return template.replace('{%ENTRIES%}', JSON.stringify(Object.keys(this.fileLookup).map(file => file.replace(EXT_RE, ''))));
    }

    return undefined;
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by ember-cli
   * @param {Object} startOptions - Express server start options
   */
  serverMiddleware: function(startOptions) {
    this.testemMiddleware(startOptions.app);
  },

  testemMiddleware: function(app) {
    if (!this._isCoverageEnabled()) { return; }
    attachMiddleware(app, {
      configPath: this.project.configPath(),
      root: this.project.root,
      fileLookup: this.fileLookup
    });
  },

  // Custom Methods

  /**
   * Thin wrapper around exists-sync that allows easy stubbing in tests
   * @param {String} path - path to check existence of
   * @returns {Boolean} whether or not path exists
   */
  _existsSync: function(path) {
    return existsSync(path);
  },

  /**
   * Get project configuration
   * @returns {Configuration} project configuration
   */
  _getConfig: function() {
    return config(this.project.configPath());
  },

  /**
   * Get paths to include for coverage
   * @returns {Array<String>} include paths
   */
  _getIncludes: function(dir, folder, prefix) {
    let globs = this.registry.extensionsForType('js').map((extension) => `**/*.${extension}`);

    return walkSync(dir, { directories: false, globs }).map(file => {
      let module = prefix + '/' + file.replace(EXT_RE, '.js');
      this.fileLookup[module] = path.join(folder, file);
      return module;
    });
  },

  /**
   * Get paths to exclude from coverage
   * @returns {Array<String>} exclude paths
   */
  _getExcludes: function() {
    return this._getConfig().excludes || [];
  },

  /**
   * Determine whether or not coverage is enabled
   * @returns {Boolean} whether or not coverage is enabled
   */
  _isCoverageEnabled: function() {
    var value = process.env[this._getConfig().coverageEnvVar] || false;

    if (value.toLowerCase) {
      value = value.toLowerCase();
    }

    return ['true', true].indexOf(value) !== -1;
  },

  /**
   * Determine the name of the parent app or addon.
   * @returns {String} the name of the parent
   */
  _parentName: function() {
    if (this.parent.isEmberCLIAddon()) {
      return this._findCoveredAddon().name;
    } else {
      return this.parent.name();
    }
  },

  /**
   * Find the addon (if any) that's being covered.
   * @returns {Addon} the addon under test
   */
  _findCoveredAddon: function() {
    if (!this._coveredAddon) {
      this._coveredAddon = this.project.findAddonByName(this.project.pkg.name);
    }

    return this._coveredAddon;
  }
};
