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
    let exclude = ['*/mirage/**/*', '*/node_modules/**/*'];
    let coverageEnvVar = 'COVERAGE';
    let configBase = 'config';

    let pkgJSON = fs.readJSONSync(path.join(cwd, 'package.json'));

    if (pkgJSON['ember-addon'] && pkgJSON['ember-addon'].configPath) {
      configBase = pkgJSON['ember-addon'].configPath;
    }

    if (fs.existsSync(path.join(cwd, configBase, 'coverage.js'))) {
      let config = require(path.join(cwd, configBase, 'coverage.js'));

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

  buildNamespaceMappings() {
    let rootNamespaceMappings = new Map();
    function recurse(item) {
      if (item.isEmberCLIProject && item.isEmberCLIProject()) {
        let projectConfig = item.config(process.env.EMBER_ENV);
        rootNamespaceMappings.set(
          projectConfig.modulePrefix,
          path.join(item.root, 'app')
        );
      } else if (item.treePaths) {
        let addonPath = path.join(item.root, item.treePaths.addon);
        let addonTestSupportPath = path.join(
          item.root,
          item.treePaths['addon-test-support']
        );
        rootNamespaceMappings.set(item.name, addonPath);
        rootNamespaceMappings.set(
          path.join(item.name, 'test-support'),
          addonTestSupportPath
        );
      }
      item.addons.forEach((i) => recurse(i));
    }

    recurse(this.project);

    // this adds a "default" lookup to the namespace in the event that there is no
    // namespace. this comes up under embroider depending on the app structure of
    // the stage 2 workspace directory. it could be either /tmp/embroider/hash/app.js
    // or /tmp/embroider/hash/app-name/app.js
    let projectNamespace = this.parent.isEmberCLIProject() ? 'app' : 'addon';
    rootNamespaceMappings.set(
      '/',
      path.join(this.project.root, projectNamespace)
    );

    return rootNamespaceMappings;
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by ember-cli
   * @param {Object} startOptions - Express server start options
   */
  serverMiddleware(startOptions) {
    attachMiddleware.serverMiddleware(startOptions.app, {
      configPath: this.project.configPath(),
      root: this.project.root,
      namespaceMappings: this.buildNamespaceMappings(),
    });
  },

  testemMiddleware(app) {
    const config = {
      configPath: this.project.configPath(),
      root: this.project.root,
      namespaceMappings: this.buildNamespaceMappings(),
    };
    // if we're running `ember test --server` use the `serverMiddleware`.
    if (process.argv.includes('--server') || process.argv.includes('-s')) {
      return this.serverMiddleware({ app }, config);
    }
    attachMiddleware.testMiddleware(app, config);
  },
};
