'use strict';

var path = require('path');
var existsSync = require('exists-sync');
var fs = require('fs-extra');
var attachMiddleware = require('./lib/attach-middleware');
var config = require('./lib/config');
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

module.exports = {
  name: 'ember-cli-code-coverage',

  // Ember Methods

  _getParentOptions: function() {
    let options;

    // The parent can either be an Addon or a Project. If it's the project,
    // we want to use the app instead.
    if (this.parent !== this.project) {
      // the parent is an addon, so use its options directly
      options = this.parent.options = this.parent.options || {};
    } else {
      // the parent is the project, and therefore we need to use
      // the app.options instead
      options = this.app.options = this.app.options || {};
    }

    return options;
  },

  included: function() {
    this._super.included.apply(this, arguments);

    let parentOptions = this._getParentOptions();

    if (!this._registeredWithBabel && this._isCoverageEnabled()) {
      let checker = new VersionChecker(this.parent).for('ember-cli-babel', 'npm');

      if (checker.satisfies('>= 6.0.0')) {
        const IstanbulPlugin = requireBabelPlugin('babel-plugin-istanbul');

        // Create babel options if they do not exist
        parentOptions.babel = parentOptions.babel || {};

        // Create and pull off babel plugins
        let plugins = parentOptions.babel.plugins = parentOptions.babel.plugins || [];

        plugins.push([IstanbulPlugin, { exclude: this._getExcludes() }]);
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
      return template.replace('{%PROJECT_NAME%}', this._parentName());
    }

    return undefined;
  },

  includedCommands: function () {
    return {
      'coverage-merge': require('./lib/coverage-merge')
    };
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
    attachMiddleware(app, { configPath: this.project.configPath(), root: this.project.root });
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
   * Get paths to exclude from coverage
   * @returns {Array<String>} exclude paths
   */
  _getExcludes: function() {
    var excludes = this._getConfig().excludes || [];

    return excludes;
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
