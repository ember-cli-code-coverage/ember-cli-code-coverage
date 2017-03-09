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
  name: 'ember-cli-code-coverage',

  // Ember Methods

  included: function() {
    if (this._isCoverageEnabled() && this.parent.isEmberCLIAddon()) {
      var coveredAddon = this._findCoveredAddon();
      var coverageAddonContext = this;

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
      var template = fs.readFileSync(path.join(__dirname, 'lib', 'templates', 'test-body-footer.html')).toString();
      return template.replace('{%PROJECT_NAME%}', this._parentName());
    }

    return undefined;
  },

  preprocessTree: function(type, tree) {
    var useBabelInstrumenter = this._getConfig().useBabelInstrumenter === true;

    if (!this._isCoverageEnabled() || (type !== 'js' && type !=='addon-js')) {
      return tree;
    }

    var appFiles = new Funnel(tree, {
      exclude: this._getExcludes()
    });

    var instrumentedNode = new CoverageInstrumenter(appFiles, {
      annotation: 'Instrumenting for code coverage',
      appName: this._parentName(),
      appRoot: this.parent.root,
      babelOptions: this.app.options.babel,
      isAddon: this.project.isEmberCLIAddon(),
      useBabelInstrumenter: useBabelInstrumenter,
      templateExtensions: this.registry.extensionsForType('template')
    });

    return new BroccoliMergeTrees([tree, instrumentedNode], { overwrite: true });
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
   * Check if a file exists within the current app directory
   * @param {String} relativePath - path to file within current app
   * @returns {Boolean} whether or not the file exists within the current app
   */
  _doesFileExistInCurrentProjectApp: function(relativePath) {
    relativePath = path.join('app', relativePath);

    if (this._existsSync(relativePath)) {
      return true;
    }

    return this._doesTemplateFileExist(relativePath);
  },

  /**
   * Check if a file exists within the current addon directory
   * @param {String} relativePath - path to file within current app
   * @returns {Boolean} whether or not the file exists within the current app
   */
  _doesFileExistInCurrentProjectAddon: function(relativePath) {
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
  _doesFileExistInCurrentProjectAddonModule: function(relativePath) {
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
  _doesFileExistInDummyApp: function(relativePath) {
    relativePath = path.join('tests', 'dummy', 'app', relativePath);

    if (this._existsSync(relativePath)) {
      return true;
    }

    return this._doesTemplateFileExist(relativePath);
  },

  /**
   * Check if a template file exists within the current app/addon
   * Note: Template files are already compiled into JavaScript files so we must
   * check for the pre-compiled .hbs file
   * @param {String} relativePath - path to file within current app/addon
   * @returns {Boolean} whether or not the file exists within the current app/addon
   */
  _doesTemplateFileExist: function(relativePath) {
    var templateExtensions = this.registry.extensionsForType('template');

    for (var i = 0, len = templateExtensions.length; i < len; i++) {
      var extension = templateExtensions[i];
      var extensionPath = relativePath.replace('.js', '.' + extension);

      if (this._existsSync(extensionPath)) {
        return true;
      }
    }

    return false;
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
   * Filter out files that come from other Ember addons and do not live within this app/addon
   * @param {String} name - name of current app/addon
   * @param {String} relativePath - relative path to file
   * @returns {Boolean} whether or not to filter out file
   */
  _filterOutAddonFiles: function(name, relativePath) {
    if (relativePath.indexOf(name + '/') === 0) {
      relativePath = relativePath.replace(name + '/', '');
    }

    if (relativePath.indexOf('dummy/') === 0) {
      relativePath = relativePath.replace('dummy/', '');
    }

    var remove;

    //do default exclude logic
    if (this._doesFileExistInDummyApp(relativePath)) {
      remove = true;  //remove dummy app files by default
    } else {
      remove = !(
        this._doesFileExistInCurrentProjectApp(relativePath) ||
        this._doesFileExistInCurrentProjectAddon(relativePath) ||
        this._doesFileExistInCurrentProjectAddonModule(relativePath)
      );
    }

    //do exclude logic from config
    var shouldIncludeFile = this._getConfig('shouldIncludeFile');
    if (typeof shouldIncludeFile === 'function') {
      var shouldInclude = shouldIncludeFile(this.project, relativePath, !remove);
      if (shouldInclude !== 'null') {
        remove = !shouldInclude;
      }
    }

    return remove;
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
    var name = this._parentName();
    excludes.push(this._filterOutAddonFiles.bind(this, name));

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
