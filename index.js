/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs-extra');
var Funnel = require('broccoli-funnel');
var BroccoliMergeTrees = require('broccoli-merge-trees');
var CoverageInstrumenter = require('./lib/coverage-instrumenter');
var attachMiddleware = require('./lib/attach-middleware');
var config = require('./lib/config');

module.exports = {
  name: 'ember-cli-code-coverage',

  /**
   * Get content for type
   * @param {String} type - type to get content for
   * @returns {String} content for type
   */
  contentFor: function(type) {
    // If coverage is enabled add content to test-body-footer to show percentages
    if (this._coverageIsEnabled() && type === 'test-body-footer') {
      return fs.readFileSync(path.join(__dirname, 'lib', 'templates', 'test-body-footer.html'));
    }

    return undefined;
  },

  /**
   * Add instrumentation to JavaScript tree if coverage is enabled
   * @param {String} type - what kind of tree
   * @param {Tree} tree - tree to process
   * @returns {Tree} processed tree
   */
  postprocessTree: function(type, tree) {
    // If coverage isn't enabled or tree is not JavaScript tree then we don't need to alter the tree
    if (!this._coverageIsEnabled() || type !== 'js') {
      return tree;
    }

    // Make sure we exlcude files defined in the configuration as well as files from addons
    var appFiles = new Funnel(tree, {
      exclude: this._config().excludes
    });

    // Instrument JavaScript for code coverage
    var instrumentedNode = new CoverageInstrumenter(appFiles, {
      annotation: 'Instrumenting for code coverage'
    });

    // Return JavaScript tree with instrumented source
    return new BroccoliMergeTrees([tree, instrumentedNode], { overwrite: true });
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by ember-cli
   * @param {Object} startOptions - Express server start options
   */
  serverMiddleware: function(startOptions) {
    this.testemMiddleware(startOptions.app);
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by testem
   * @param {Object} app - the Express app instance
   */
  testemMiddleware: function(app) {
    if (!this._coverageIsEnabled()) { return; }
    attachMiddleware(app, { root: this.project.root, ui: this.ui });
  },

  /**
   * Determine whether or not coverage is enabled
   * @returns {Boolean} whether or not coverage is enabled
   */
  _coverageIsEnabled: function() {
    return process.env[this._config().coverageEnvVar];
  },

  /**
   * Get project configuration
   * @returns {Configuration} project configuration
   */
  _config: function() {
    return config(this.project.root);
  }
};
