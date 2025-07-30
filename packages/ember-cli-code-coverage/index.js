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
    let extension = [
      '.gjs',
      '.gts',
      '.js',
      '.ts',
      '.cjs',
      '.mjs',
      '.mts',
      '.cts',
    ];
    let coverageEnvVar = 'COVERAGE';
    let configBase = 'config';

    let pkgJSON = fs.readJSONSync(path.join(cwd, 'package.json'));

    if (pkgJSON['ember-addon'] && pkgJSON['ember-addon'].configPath) {
      configBase = pkgJSON['ember-addon'].configPath;
    }

    let config = {};

    if (fs.existsSync(path.join(cwd, configBase, 'coverage.js'))) {
      config = require(path.join(cwd, configBase, 'coverage.js'));

      if (config.excludes) {
        exclude = config.excludes;
      }

      if (config.coverageEnvVar) {
        coverageEnvVar = config.coverageEnvVar;
      }

      if (config.extension) {
        extension = config.extension;
      }
    }

    if (process.env[coverageEnvVar] !== 'true') {
      return [];
    }

    if (opts.embroider === true) {
      try {
        // Attempt to import the utility @embroider/compat uses in >3.1 to locate the embroider working directory
        // the presence of this `locateEmbroiderWorkingDir` method coincides with the shift to utilize `rewritten-app` tmp dir
        // eslint-disable-next-line node/no-missing-require
        let { locateEmbroiderWorkingDir } = require('@embroider/core');
        cwd = path.resolve(locateEmbroiderWorkingDir(cwd), 'rewritten-app');
      } catch (err) {
        // otherwise, fall back to the method used in embroider <3.1
        let {
          stableWorkspaceDir,
          // eslint-disable-next-line node/no-missing-require
        } = require('@embroider/compat/src/default-pipeline');
        cwd = stableWorkspaceDir(cwd, process.env.EMBER_ENV);
      }
    }

    const IstanbulPlugin = require.resolve('babel-plugin-istanbul');
    return [
      // String lookup is needed to workaround https://github.com/embroider-build/embroider/issues/1525
      path.resolve(__dirname, 'lib/gjs-gts-istanbul-ignore-template-plugin'),
      [IstanbulPlugin, { cwd, include: '**/*', exclude, extension }],
    ].concat(
      config.enableTemplateCoverage
        ? [
            [
              // eslint-disable-next-line node/no-missing-require
              require.resolve('babel-plugin-ember-template-compilation'),
              {
                transforms: [this.buildTemplatePlugin({ cwd, exclude })],
                enableLegacyModules: [
                  'ember-cli-htmlbars',
                  'ember-cli-htmlbars-inline-precompile',
                  'htmlbars-inline-precompile',
                ],
              },
            ],
          ]
        : []
    );
  },

  includedCommands() {
    return {
      'coverage-merge': require('./lib/coverage-merge'),
    };
  },

  _isCoverageEnabled() {
    let config = this.project.config(process.env.EMBER_ENV)[this.name] || {};
    return process.env[config.coverageEnvVar || 'COVERAGE'] === 'true';
  },

  treeForAddon() {
    if (this._isCoverageEnabled()) {
      return this._super.treeForAddon.apply(this, arguments);
    }
  },

  treeForApp() {
    if (this._isCoverageEnabled()) {
      return this._super.treeForApp.apply(this, arguments);
    }
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
        const moduleName = item.moduleName();
        rootNamespaceMappings.set(moduleName, addonPath);
        rootNamespaceMappings.set(
          path.join(moduleName, 'test-support'),
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
    attachMiddleware.serverMiddleware(
      startOptions.app,
      this._middlewareConfig()
    );
  },

  testemMiddleware(app) {
    // if we're running `ember test --server` use the `serverMiddleware`.
    if (process.argv.includes('--server') || process.argv.includes('-s')) {
      return this.serverMiddleware({ app });
    }
    attachMiddleware.testMiddleware(app, this._middlewareConfig());
  },

  _middlewareConfig() {
    return {
      configPath: this.project.configPath(),
      root: this.project.root,
      namespaceMappings: this.buildNamespaceMappings(),
    };
  },

  buildTemplatePlugin(params = {}) {
    const buildTemplateInstrumenter = require('./lib/template-instrumenter');
    let plugin = buildTemplateInstrumenter(params);

    plugin._parallelBabel = {
      requireFile: __filename,
      buildUsing: 'buildTemplatePlugin',
      params,
    };
    plugin.baseDir = function () {
      return __dirname;
    };
    plugin.cacheKey = function () {
      return 'template-instrumenter';
    };

    return plugin;
  },
};
