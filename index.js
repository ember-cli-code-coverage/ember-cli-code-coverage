'use strict';

var path = require('path');
var fs = require('fs-extra');
var attachMiddleware = require('./lib/attach-middleware');
var config = require('./lib/config');
const walkSync = require('walk-sync');
const VersionChecker = require('ember-cli-version-checker');
const concat = require('lodash.concat');

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

function getPlugins(appOrAddon) {
  let options = appOrAddon.options = appOrAddon.options || {};
  options.babel = options.babel || {};
  return options.babel.plugins = options.babel.plugins || [];
}

// Regular expression to extract the file extension from a path.
const EXT_RE = /\.[^\.]+$/;

let fileLookup = null;

module.exports = {
  name: require('./package').name,

  /**
   * Look up the file path from an ember module path.
   * @type {Object<String, String>}
   */
  fileLookup: null,

  // Ember Methods

  included: function(appOrAddon) {
    this._super.included.apply(this, arguments);

    fileLookup = this.fileLookup = {};
    this.parentRegistry = appOrAddon.registry;

    if (!this._registeredWithBabel && this._isCoverageEnabled()) {
      let checker = new VersionChecker(this.parent).for('ember-cli-babel', 'npm');

      if (checker.satisfies('>= 6.0.0')) {
        const IstanbulPlugin = requireBabelPlugin('babel-plugin-istanbul');
        const exclude = this._getExcludes();
        const include = this._getIncludes();

        concat(
          this.app,
          this._findCoveredAddon(),
          this._findInRepoAddons()
        )
          .filter(Boolean)
          .map(getPlugins)
          .forEach((plugins) => plugins.push([IstanbulPlugin, { exclude, include }]));

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

  includedCommands: function() {
    return {
      'coverage-merge': require('./lib/coverage-merge')
    };
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by ember-cli
   * @param {Object} startOptions - Express server start options
   */
  serverMiddleware: function(startOptions) {
    if (!this._isCoverageEnabled()) {
      return;
    }
    attachMiddleware.serverMiddleware(startOptions.app, {
      configPath: this.project.configPath(),
      root: this.project.root,
      fileLookup: fileLookup
    });
  },

  testemMiddleware: function(app) {
    if (!this._isCoverageEnabled()) {
      return;
    }
    const config = {
      configPath: this.project.configPath(),
      root: this.project.root,
      fileLookup: fileLookup
    };
    // if we're running `ember test --server` use the `serverMiddleware`.
    if (process.argv.includes('--server') || process.argv.includes('-s')) {
      return this.serverMiddleware({ app }, config);
    }
    attachMiddleware.testMiddleware(app, config);
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
  _getIncludes: function() {
    return concat(
      this._getIncludesForAppDirectory(),
      this._getIncludesForAddonDirectory(),
      this._getIncludesForInRepoAddonDirectories()
    ).filter(Boolean);
  },

  /**
   * Get paths to include for covering the "app" directory.
   * @returns {Array<String>} include paths
   */
  _getIncludesForAppDirectory: function() {
    const dir = path.join(this.project.root, 'app');
    let prefix = this.parent.isEmberCLIAddon() ? 'dummy' : this.parent.name();
    return this._getIncludesForDir(dir, prefix);
  },

  /**
   * Get paths to include for covering the "addon" directory.
   * @returns {Array<String>} include paths
   */
  _getIncludesForAddonDirectory: function() {
    let addon = this._findCoveredAddon();
    if (addon) {
      const addonDir = path.join(this.project.root, 'addon');
      const addonTestSupportDir = path.join(this.project.root, 'addon-test-support');
      return concat(
        this._getIncludesForDir(addonDir, addon.name),
        this._getIncludesForDir(addonTestSupportDir, `${addon.name}/test-support`)
      );
    }
  },

  /**
   * Get paths to include for covering the in-repo-addon directories in "lib/*".
   * @returns {Array<String>} include paths
   */
  _getIncludesForInRepoAddonDirectories: function() {
    return this._findInRepoAddons().reduce((acc, addon) => {
      let addonDir = path.join(this.project.root, 'lib', addon.name);
      let addonAppDir = path.join(addonDir, 'app');
      let addonAddonDir = path.join(addonDir, 'addon');
      const addonAddonTestSupportDir = path.join(addonDir, 'addon-test-support');
      return concat(
        acc,
        this._getIncludesForDir(addonAppDir, this.parent.name()),
        this._getIncludesForDir(addonAddonDir, addon.name),
        this._getIncludesForDir(addonAddonTestSupportDir, `${addon.name}/test-support`)
      );
    }, []);
  },

  /**
   * Get paths to include for coverage
   * @param {String} dir Include all js files under this directory.
   * @param {String} prefix The prefix to the ember module ('app', 'dummy' or the name of the addon).
   * @returns {Array<String>} include paths
   */
  _getIncludesForDir: function(dir, prefix) {
    const hasEmberCliTypescript = this.project && this.project.findAddonByName && this.project.findAddonByName('ember-cli-typescript');
    if (fs.existsSync(dir)) {
      let dirname = path.relative(this.project.root, dir);
      let globs = this.parentRegistry.extensionsForType('js').map((extension) => `**/*.${extension}`);

      return walkSync(dir, { directories: false, globs }).map(file => {
        const postfix = hasEmberCliTypescript ? file : file.replace(EXT_RE, '.js');
        const module = prefix + '/' + postfix;
        this.fileLookup[module] = path.join(dirname, file);
        return module;
      });
    } else {
      return [];
    }
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
  },

  /**
   * Find the app's in-repo addons (if any).
   * @returns {Array<Addon>} the in-repo addons
   */
  _findInRepoAddons: function() {
    if (!this._inRepoAddons) {
      const pkg = this.project.pkg;
      const inRepoAddonPaths = pkg['ember-addon'] && pkg['ember-addon'].paths;
      this._inRepoAddons = (inRepoAddonPaths || []).map((addonPath) => {
        let addonName = path.basename(addonPath);
        return this.project.findAddonByName(addonName);
      });
    }

    return this._inRepoAddons.filter(Boolean);
  }
};
