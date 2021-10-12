'use strict';

let attachMiddleware = require('./lib/attach-middleware');
let fs = require('fs');
let path = require('path');

module.exports = {
  name: require('./package').name,

  /*
   *  Optional options are:
   *  - cwd
   *  - coverageEnvVar
   *  - embroider
   *  - exclude
   */
  buildBabelPlugin(opts = {}) {
    let cwd = opts.cwd || process.cwd();
    let exclude = opts.exclude || ['*/mirage/**/*'];
    let coverageEnvVar = opts.coverageEnvVar || 'COVERAGE';

    // TODO: support custom config location
    if (fs.existsSync(path.join(process.cwd(), 'config/coverage.js'))) {
      let config = require(path.join(process.cwd(), 'config/coverage.js'));

      if (config.excludes) {
        exclude = config.excludes;
      }
    }

    if (process.env[coverageEnvVar] !== 'true') {
      return [];
    }

    if (opts.embroider === true) {
      let {
        stableWorkspaceDir,
      } = require('@embroider/compat/src/default-pipeline');
      cwd = stableWorkspaceDir(cwd);
    }

    const IstanbulPlugin = require.resolve('babel-plugin-istanbul');
    return [[IstanbulPlugin, { cwd, include: '**/*', exclude }]];
  },

  includedCommands() {
    return {
      'coverage-merge': require('./lib/coverage-merge'),
    };
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by ember-cli
   * @param {Object} startOptions - Express server start options
   */
  serverMiddleware(startOptions) {
    attachMiddleware.serverMiddleware(startOptions.app, {
      configPath: this.project.configPath(),
      root: this.project.root,
      fileLookup: this.fileLookup,
      isAddon: this.parent.isEmberCLIAddon(),
    });
  },

  testemMiddleware(app) {
    const config = {
      configPath: this.project.configPath(),
      root: this.project.root,
      fileLookup: this.fileLookup,
      isAddon: this.parent.isEmberCLIAddon(),
    };
    // if we're running `ember test --server` use the `serverMiddleware`.
    if (process.argv.includes('--server') || process.argv.includes('-s')) {
      return this.serverMiddleware({ app }, config);
    }
    attachMiddleware.testMiddleware(app, config);
  },
};
