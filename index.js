'use strict';

var path = require('path');
var existsSync = require('exists-sync');
var fs = require('fs-extra');
var attachMiddleware = require('./lib/attach-middleware');
var config = require('./lib/config');
const walkSync = require('walk-sync');
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

    this.fileLookup = {};

    if (!this._registeredWithBabel && this._isCoverageEnabled()) {
      let checker = new VersionChecker(this.parent).for('ember-cli-babel', 'npm');

      if (checker.satisfies('>= 6.0.0')) {
        this.IstanbulPlugin = requireBabelPlugin('babel-plugin-istanbul');

        this._instrumentAppDirectory();
        this._instrumentAddonDirectory();
        this._instrumentInRepoAddonDirectories();
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
    attachMiddleware(app, {
      configPath: this.project.configPath(),
      root: this.project.root,
      fileLookup: this.fileLookup
    });
  },

  // Custom Methods

  /**
   * Instrument the "app" directory.
   */
  _instrumentAppDirectory() {
    const dir = path.join(this.project.root, 'app');
    let prefix = this.parent.isEmberCLIAddon() ? 'dummy' : this.parent.name();
    this._instrumentDirectory(this.app, dir, prefix);
  },

  /**
   * Instrument the "addon" directory.
   */
  _instrumentAddonDirectory() {
    let addon = this._findCoveredAddon();
    if (addon) {
      const dir = path.join(this.project.root, 'addon');
      this._instrumentDirectory(addon, dir, addon.name);
    }
  },

  /**
   * Instrument the in-repo-addon directories in "lib/*".
   */
  _instrumentInRepoAddonDirectories() {
    const pkg = this.project.pkg;
    if (pkg['ember-addon'] && pkg['ember-addon'].paths) {
      pkg['ember-addon'].paths.forEach((addonPath) => {
        let addonName = path.basename(addonPath);
        let addonDir = path.join(this.project.root, addonPath);
        let addon = this.project.findAddonByName(addonName);
        let addonAppDir = path.join(addonDir, 'app');
        let addonAddonDir = path.join(addonDir, 'addon');
        this._instrumentDirectory(this.app, addonAppDir, this.parent.name());
        this._instrumentDirectory(addon, addonAddonDir, addonName);
      });
    }
  },

  /**
   * Instrument directory helper.
   * @param {Object} appOrAddon The Ember app or addon config.
   * @param {String} dir The path to the Ember app or addon.
   * @param {String} modulePrefix The prefix to the ember module ('app', 'dummy' or the name of the addon).
   */
  _instrumentDirectory(appOrAddon, dir, modulePrefix) {
    if (fs.existsSync(dir)) {
      let options = appOrAddon.options = appOrAddon.options || {};
      options.babel = options.babel || {};
      let plugins = options.babel.plugins = options.babel.plugins || [];
      plugins.push([this.IstanbulPlugin, {
        exclude: this._getExcludes(),
        include: this._getIncludes(dir, modulePrefix)
      }]);
    }
  },

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
   * @param {String} dir Include all js files under this directory.
   * @param {String} prefix The prefix to the ember module ('app', 'dummy' or the name of the addon).
   * @returns {Array<String>} include paths
   */
  _getIncludes: function(dir, prefix) {
    let dirname = path.relative(this.project.root, dir);
    let globs = this.registry.extensionsForType('js').map((extension) => `**/*.${extension}`);

    return walkSync(dir, { directories: false, globs }).map(file => {
      let module = prefix + '/' + file.replace(EXT_RE, '.js');
      this.fileLookup[module] = path.join(dirname, file);
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
