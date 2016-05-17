/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs-extra');
var Funnel = require('broccoli-funnel');
var BroccoliMergeTrees = require('broccoli-merge-trees');
var CoverageInstrumenter = require('./lib/coverage-instrumenter');
var attachMiddleware = require('./lib/attach-middleware');
var config = require('./lib/config');
var pathFixer = require('./lib/path-fixer');

module.exports = {
  name: 'ember-cli-code-coverage',

  contentFor: function(type) {
    if (!this._coverageIsEnabled()) { return; }
    if (type === 'test-body-footer') {
      return fs.readFileSync(path.join(__dirname, 'lib', 'templates', 'test-body-footer.html'));
    }
  },

  postprocessTree: function(type, tree) {
    if (this._coverageIsEnabled() && type === 'js') {
      var appFiles = new Funnel(tree, {
        exclude: this._getExcludes()
      });
      var instrumentedNode = new CoverageInstrumenter(appFiles, {
        annotation: 'Instrumenting for code coverage',
        app: this.app
      });
      return new BroccoliMergeTrees([tree, instrumentedNode], { overwrite: true });
    }
    return tree;
  },
  testemMiddleware: function(app) {
    if (!this._coverageIsEnabled()) { return; }
    attachMiddleware(app, { root: this.project.root, ui: this.ui });
  },
  serverMiddleware: function(options) {
    if (!this._coverageIsEnabled()) { return; }
    attachMiddleware(options.app, { root: this.project.root, ui: this.ui });
  },
  _coverageIsEnabled: function() {
    return process.env[this._config().coverageEnvVar];
  },
  _config: function() {
    return config(this.project.root);
  },
  _getExcludes: function() {
    var excludes = this._config().excludes;

    var _this = this;
    excludes.push(function(relativePath) {
      relativePath = pathFixer.fixPath(relativePath, _this.app);

      // filters out files that don't exist on disk (come from an addon)
      try {
        fs.statSync(relativePath);
      } catch (err) {
        return true;
      }

      return false;
    });

    return excludes;
  }
};
