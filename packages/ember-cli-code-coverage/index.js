'use strict';

let path = require('path');
let fs = require('fs-extra');
let attachMiddleware = require('./lib/attach-middleware');
let createTemplateCoveragePlugin = require('./lib/template-coverage-plugin');

module.exports = {
  name: require('./package').name,

  // Prevent ember-cli-babel from inheriting the host app's
  // throwUnlessParallelizable when transpiling this addon's own files.
  // Without this, apps with throwUnlessParallelizable: true would fail
  // because _getAddonOptions falls through to app.options when
  // this.parent.options is undefined.
  options: {
    babel: {},
  },

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
  /**
    @example <caption>Default mode (Istanbul instrumentation for all files)</caption>
    let app = new EmberApp(defaults, {
      babel: {
        plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
      },
    });

    @example <caption>V8 compat mode (template-only Istanbul, JS/TS via V8)</caption>
    let app = new EmberApp(defaults, {
      babel: {
        plugins: [...require('ember-cli-code-coverage').buildBabelPlugin({ v8: true })],
      },
    });

    @param {Object} [opts]
    @param {string} [opts.cwd] - working directory (defaults to process.cwd())
    @param {boolean} [opts.embroider] - set to true for Embroider builds
    @param {boolean} [opts.v8] - V8 compat mode: skip babel-plugin-istanbul,
      only include the template coverage import plugin for .gjs/.gts strict-mode
      support. Use this when JS/TS coverage is collected externally via V8/CDP
      (e.g. testem-code-coverage). Template branch coverage still works via the
      AST plugin registered in setupPreprocessorRegistry.
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

    if (fs.existsSync(path.join(cwd, configBase, 'coverage.js'))) {
      let config = require(path.join(cwd, configBase, 'coverage.js'));

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

    // V8 compat mode: skip Istanbul instrumentation entirely.
    // Only include the import plugin so .gjs/.gts strict-mode templates can
    // resolve the coverage helpers (coverageInit, coverageMark, coverageCond).
    // JS/TS coverage is expected to come from an external V8/CDP collector.
    if (opts.v8 === true) {
      return [path.resolve(__dirname, 'lib/template-coverage-import-plugin')];
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

    // Build the istanbul plugin entry as a standard [path, opts] tuple so it
    // works in both standard Babel (Rollup, v2 addons) and broccoli-babel-transpiler
    // (classic ember-cli). Attach _parallelBabel on the array so broccoli-babel-transpiler
    // can reconstruct it in worker threads (arrays are objects in JS).
    const IstanbulPlugin = require.resolve('babel-plugin-istanbul');
    const istanbulEntry = [
      IstanbulPlugin,
      { cwd, include: '**/*', exclude, extension },
    ];
    istanbulEntry._parallelBabel = {
      requireFile: path.resolve(__dirname, 'lib/istanbul-plugin-wrapper'),
      buildUsing: 'buildIstanbulPlugin',
      params: { cwd, include: '**/*', exclude, extension },
    };

    return [
      // Inject coverage helper imports into .gjs/.gts files for strict-mode template support.
      // Must run BEFORE babel-plugin-ember-template-compilation so imports are in scope.
      path.resolve(__dirname, 'lib/template-coverage-import-plugin'),
      // String lookup is needed to workaround https://github.com/embroider-build/embroider/issues/1525
      path.resolve(__dirname, 'lib/gjs-gts-istanbul-ignore-template-plugin'),
      istanbulEntry,
    ];
  },

  /**
   * Returns the template coverage AST plugin for use with
   * babel-plugin-ember-template-compilation transforms.
   *
   * @example
   * // In ember-cli-build.js, for Embroider apps:
   * plugins: [
   *   ['babel-plugin-ember-template-compilation', {
   *     transforms: [
   *       ...require('ember-cli-code-coverage').buildTemplateCoveragePlugin(),
   *     ],
   *   }],
   * ]
   *
   * @param {Object} [opts]
   * @param {string} [opts.coverageEnvVar='COVERAGE'] - environment variable name
   * @returns {Function[]} Array containing the AST plugin factory (empty if coverage disabled)
   */
  buildTemplateCoveragePlugin(opts = {}) {
    let coverageEnvVar = opts.coverageEnvVar || 'COVERAGE';

    if (process.env[coverageEnvVar] !== 'true') {
      return [];
    }

    return [createTemplateCoveragePlugin({ coverageEnvVar })];
  },

  /**
   * Register the template coverage AST plugin with ember-cli-htmlbars.
   * This is called automatically by ember-cli for v1 addons.
   * Covers .hbs files and .gjs/.gts files compiled through ember-cli-htmlbars.
   */
  setupPreprocessorRegistry(type, registry) {
    // Only register for the parent (consuming app), not for 'self',
    // to avoid double-registering the plugin.
    if (type !== 'parent') {
      return;
    }

    // Determine the coverage env var from config (if available)
    let coverageEnvVar = 'COVERAGE';

    try {
      let cwd = this.project ? this.project.root : process.cwd();
      let configBase = 'config';
      let pkgJSON = fs.readJSONSync(path.join(cwd, 'package.json'));

      if (pkgJSON['ember-addon'] && pkgJSON['ember-addon'].configPath) {
        configBase = pkgJSON['ember-addon'].configPath;
      }

      if (fs.existsSync(path.join(cwd, configBase, 'coverage.js'))) {
        let config = require(path.join(cwd, configBase, 'coverage.js'));
        if (config.coverageEnvVar) {
          coverageEnvVar = config.coverageEnvVar;
        }
      }
    } catch (e) {
      // Config not available yet, use default
    }

    // Register the AST plugin. The plugin itself checks the env var at runtime
    // and no-ops if coverage is not enabled, so the build overhead is minimal.
    // The parallelBabel property tells ember-cli-htmlbars how to reconstruct
    // the plugin in worker threads for parallel template compilation.
    registry.add('htmlbars-ast-plugin', {
      name: 'ember-cli-code-coverage-template',
      plugin: createTemplateCoveragePlugin({ coverageEnvVar }),
      parallelBabel: {
        requireFile: path.resolve(__dirname, 'lib/template-coverage-plugin'),
        buildUsing: 'buildForParallel',
        params: { coverageEnvVar },
      },
      baseDir: function () {
        return __dirname;
      },
      cacheKey: function () {
        return (
          'ember-cli-code-coverage-template-' +
          (process.env[coverageEnvVar] === 'true' ? 'on' : 'off')
        );
      },
    });
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
};
