'use strict';

let path = require('path');
let fs = require('fs-extra');
let attachMiddleware = require('./lib/attach-middleware');

module.exports = {
  name: require('./package').name,

  /**
    @example
    let app = new EmberApp(defaults, {
      babel: {
        plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
      },
    });

    @example
    module.exports = {
      name: require('./package').name,

      options: {
        babel: {
          plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
        },
      }
    };
   */
  buildBabelPlugin(opts = {}) {
    let cwd = opts.cwd || process.cwd();
    let exclude = ['*/mirage/**/*'];
    let coverageEnvVar = 'COVERAGE';
    let configBase = 'config';

    let pkgJSON = fs.readJSONSync(path.join(process.cwd(), 'package.json'));

    if (pkgJSON['ember-addon'] && pkgJSON['configPath']) {
      configBase = pkgJSON['configPath'];
    }

    if (fs.existsSync(path.join(process.cwd(), configBase, 'coverage.js'))) {
      let config = require(path.join(process.cwd(), configBase, 'coverage.js'));

      if (config.excludes) {
        exclude = config.excludes;
      }

      if (config.coverageEnvVar) {
        coverageEnvVar = config.coverageEnvVar;
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
