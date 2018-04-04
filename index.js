'use strict';

var path = require('path');
var existsSync = require('exists-sync');
var fs = require('fs-extra');
var Funnel = require('broccoli-funnel');
var BroccoliMergeTrees = require('broccoli-merge-trees');
var CoverageInstrumenter = require('./lib/coverage-instrumenter');
var attachMiddleware = require('./lib/attach-middleware');
var config = require('./lib/config');

module.exports = {
  name: 'ember-cli-nacho-coverage',

  // Ember Methods
  config() {
    if (this._isCoverageEnabled()) {
      this.setRequiredConfig();
    }
    return {
      'ember-cli-nacho-coverage': this._getConfig()
    }
  },

  setRequiredConfig() {
    let babelConf = this.app.options.babel;
    if (!babelConf) {
      this.app.options.babel = {};
      babelConf = this.app.options.babel;
    }

    this.app.options.babel.sourceMaps = 'inline';
  },

  included() {
    if (this._isCoverageEnabled()) {
      this.setRequiredConfig();
    }
    if (this._isCoverageEnabled() && this.parent.isEmberCLIAddon()) {

      const coveredAddon = this._findCoveredAddon();
      const coverageAddonContext = this;

      coveredAddon.processedAddonJsFiles = function (tree){
        var instrumentedTree = coverageAddonContext.preprocessTree('addon-js', this.addonJsFiles(tree));
        return this.preprocessJs(instrumentedTree, '/', this.name, {
          registry: this.registry
        });
      };
    }
  },

  contentFor: function(type) {
    if (type === 'test-body-footer' && this._isCoverageEnabled()) {
      const template = fs.readFileSync(path.join(__dirname, 'lib', 'templates', 'test-body-footer.html')).toString();
      return template.replace('{%PROJECT_NAME%}', this._parentName());
    }

    return undefined;
  },

  postprocessTree: function(type, tree) {
    if (!this._isCoverageEnabled() || (type !== 'js' && type !=='addon-js')) {
      return tree;
    }

    const appFiles = new Funnel(tree, {
      exclude: this._getExcludes()
    });

    const instrumentedNode = new CoverageInstrumenter(appFiles, {
      annotation: 'Instrumenting for code coverage',
      appName: this._parentName(),
      appRoot: this.parent.root,
      isAddon: this.project.isEmberCLIAddon(),
      preCompiledExtensions: this.registry.extensionsForType('template').concat(this._getTranspiledSourceExtensions())
    });

    return new BroccoliMergeTrees([tree, instrumentedNode], { overwrite: true });
  },

  includedCommands() {
    return {
      'coverage-merge': require('./lib/coverage-merge')
    };
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by ember-cli
   * @param {Object} startOptions - Express server start options
   */
  serverMiddleware(startOptions) {
    this.testemMiddleware(startOptions.app);
  },

  testemMiddleware(app) {
    if (!this._isCoverageEnabled()) { return; }
    attachMiddleware(app, { configPath: this.project.configPath(), root: this.project.root, config: this._getConfig() });
  },

  // Custom Methods

  /**
   * Check if a file exists within the current app directory
   * @param {String} relativePath - path to file within current app
   * @returns {Boolean} whether or not the file exists within the current app
   */
  _doesFileExistInCurrentProjectApp(relativePath) {
    relativePath = path.join('app', relativePath);

    if (this._existsSync(relativePath)) {
      return true;
    }

    return this._doesTemplateFileExist(relativePath) || this._doesFileExistAsTranspilationSource(relativePath);
  },

  /**
   * Checks if a file exists as a transpiled source specified in the addon configuration
   * @param {String} relativePath path to file within current app
   * @returns {Boolean} whether or not the file exists within the current app
   * @private
   */
  _doesFileExistAsTranspilationSource(relativePath) {
    var sourceExtensions = this._getTranspiledSourceExtensions();
    return this._doesPrecompiledFileExist(relativePath, sourceExtensions);
  },

  /**
   * Check if a file exists within the current addon directory
   * @param {String} relativePath - path to file within current app
   * @returns {Boolean} whether or not the file exists within the current app
   */
  _doesFileExistInCurrentProjectAddon(relativePath) {
    relativePath = path.join('addon', relativePath);

    if (this._existsSync(relativePath)) {
      return true;
    }

    return this._doesTemplateFileExist(relativePath);
  },

  /**
   * Check if a file exists within the current addon directory. Removing `module/<app-name>` from the path.
   * @param {String} relativePath - path to file within current app
   * @returns {Boolean} whether or not the file exists within the current app
   */
  _doesFileExistInCurrentProjectAddonModule(relativePath) {
    var relativePathWithoutProjectNamePrefix = relativePath.replace('modules' + '/' +  this._parentName(), '');
    var _relativePath = 'addon/' + relativePathWithoutProjectNamePrefix;

    if (this._existsSync(_relativePath)) {
      return true;
    }

    return this._doesTemplateFileExist(_relativePath);
  },

  /**
   * Check if a file exists within the dummy app
   * @param {String} relativePath - path to file within dummy app
   * @returns {Boolean} whether or not the file exists within the dummy app
   */
  _doesFileExistInDummyApp(relativePath) {
    relativePath = path.join('tests', 'dummy', 'app', relativePath);

    if (this._existsSync(relativePath)) {
      return true;
    }

    return this._doesTemplateFileExist(relativePath);
  },

  /**
   * Checks if a file exists as a precompilation source
   * @param {String} relativePath path to the file within the current app/addon
   * @param {String[]} extensions list of precompilation extensions that the file may exist as
   * @returns {boolean} Flag indicating whether the file exists with any of the precompilation extensions
   * @private
   */
  _doesPrecompiledFileExist(relativePath, extensions) {
    var sourceExtensions = Array.isArray(extensions) ? extensions : [];
    var extension, extensionPath;

    for (var i = 0, len = sourceExtensions.length; i < len; i++) {
      extension = sourceExtensions[i];
      extensionPath = relativePath.replace('.js', '.' + extension);

      if (this._existsSync(extensionPath)) {
        return true;
      }
    }

    return false;
  },

  /**
   * Check if a template file exists within the current app/addon
   * Note: Template files are already compiled into JavaScript files so we must
   * check for the pre-compiled .hbs file
   * @param {String} relativePath - path to file within current app/addon
   * @returns {Boolean} whether or not the file exists within the current app/addon
   */
  _doesTemplateFileExist(relativePath) {
    var templateExtensions = this.registry.extensionsForType('template');
    return this._doesPrecompiledFileExist(relativePath, templateExtensions);
  },

  /**
   * Thin wrapper around exists-sync that allows easy stubbing in tests
   * @param {String} path - path to check existence of
   * @returns {Boolean} whether or not path exists
   */
  _existsSync(path) {
    return existsSync(path);
  },

  /**
   * Filter out files that come from other Ember addons and do not live within this app/addon
   * @param {String} name - name of current app/addon
   * @param {String} relativePath - relative path to file
   * @returns {Boolean} whether or not to filter out file
   */
  _filterOutAddonFiles(name, relativePath) {
    if (relativePath.indexOf(name + '/') === 0) {
      relativePath = relativePath.replace(name + '/', '');
    }

    if (relativePath.indexOf('dummy/') === 0) {
      relativePath = relativePath.replace('dummy/', '');
    }

    var fileExists = (
      this._doesFileExistInDummyApp(relativePath) ||
      this._doesFileExistInCurrentProjectApp(relativePath) ||
      this._doesFileExistInCurrentProjectAddon(relativePath) ||
      this._doesFileExistInCurrentProjectAddonModule(relativePath)
    );

    return !fileExists;
  },

  /**
   * Get project configuration
   * @returns {Configuration} project configuration
   */
  _getConfig() {
    const appOptions = this._getAddonOptions() || {};
    const options = appOptions['ember-cli-nacho-coverage'];
    if (!this.myConfig) {
      this.myConfig = config(this.project.configPath(), options);
    }
    return this.myConfig;
  },

  _getAddonOptions() {
    return (this.parent && this.parent.options) || (this.app && this.app.options) || {};
  },

  /**
   * Gets the list of transpiled source extensions from the host configuration options
   * @returns {String[]} list of transpilation source extensions if provided
   * @private
   */
  _getTranspiledSourceExtensions() {
    return this._getConfig().includeTranspiledSources || [];
  },

  /**
   * Get paths to exclude from coverage
   * @returns {Array<String>} exclude paths
   */
  _getExcludes() {
    var excludes = this._getConfig().excludes || [];
    var name = this._parentName();
    excludes.push(this._filterOutAddonFiles.bind(this, name));

    return excludes;
  },

  /**
   * Determine whether or not coverage is enabled
   * @returns {Boolean} whether or not coverage is enabled
   */
  _isCoverageEnabled() {
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
  _parentName() {
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
  _findCoveredAddon() {
    if (!this._coveredAddon) {
      this._coveredAddon = this.project.findAddonByName(this.project.pkg.name);
    }

    return this._coveredAddon;
  }
};
