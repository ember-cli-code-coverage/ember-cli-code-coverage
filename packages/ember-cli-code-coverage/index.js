'use strict';

let path = require('path');
let {
  serverMiddleware,
  testMiddleware,
  createViteTestemMiddleware,
} = require('./lib/testem/index.js');
let { buildBabelPlugin } = require('./lib/babel/index.js');
let { createCoverageMergeCommand } = require('./lib/istanbul/index.js');

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
    return buildBabelPlugin(opts);
  },

  includedCommands() {
    return {
      'coverage-merge': createCoverageMergeCommand(),
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
   * Detect whether the host project uses `@embroider/vite`. Vite-based
   * projects need a different middleware than classic Ember CLI: Vite emits
   * absolute filesystem paths in `__coverage__`, whereas the classic
   * middleware expects module-namespaced paths and applies a remapping that
   * double-prefixes `app/` (causing files to be dropped from the report).
   * When this returns true, the addon registers
   * `createViteTestemMiddleware()` instead of the classic middleware so the
   * consumer does not need to wire it up manually in `testem.cjs`.
   * @returns {boolean}
   */
  _isViteProject() {
    const pkg = this.project && this.project.pkg;
    if (!pkg) {
      return false;
    }

    return Boolean(
      (pkg.dependencies && pkg.dependencies['@embroider/vite']) ||
        (pkg.devDependencies && pkg.devDependencies['@embroider/vite'])
    );
  },

  /**
   * If coverage is enabled attach coverage middleware to the express server run by ember-cli
   * @param {Object} startOptions - Express server start options
   */
  serverMiddleware(startOptions) {
    if (this._isViteProject()) {
      createViteTestemMiddleware({ root: this.project.root })(startOptions.app);
      return;
    }
    serverMiddleware(startOptions.app, this._middlewareConfig());
  },

  testemMiddleware(app) {
    if (this._isViteProject()) {
      createViteTestemMiddleware({ root: this.project.root })(app);
      return;
    }
    // if we're running `ember test --server` use the `serverMiddleware`.
    if (process.argv.includes('--server') || process.argv.includes('-s')) {
      return this.serverMiddleware({ app });
    }
    testMiddleware(app, this._middlewareConfig());
  },

  _middlewareConfig() {
    return {
      configPath: this.project.configPath(),
      root: this.project.root,
      namespaceMappings: this.buildNamespaceMappings(),
    };
  },
};
