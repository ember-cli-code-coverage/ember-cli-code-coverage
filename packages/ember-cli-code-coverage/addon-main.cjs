'use strict';

const path = require('path');
const { addonV1Shim } = require('@embroider/addon-shim');

/**
 * Ember CLI addon entry point (v2 addon via @embroider/addon-shim).
 *
 * The shim handles ember-auto-import registration so browser imports
 * like `ember-cli-code-coverage/test-support` are bundled by webpack.
 *
 * This addon also provides:
 * - `/write-coverage` middleware for `ember serve` and `ember test`
 * - the `coverage-merge` command for parallel test runs
 * - the template coverage AST plugin for loose-mode `.hbs` templates
 *
 * Consumers must still manually configure:
 * - the Babel plugin in ember-cli-build.js (or babel.config.cjs / vite.config.mjs)
 * - browser helpers in tests/test-helper.js
 */
const base = addonV1Shim(__dirname);

module.exports = {
  ...base,

  /**
   * Re-exported so consumers can write
   * `require('ember-cli-code-coverage').buildBabelPlugin()` in
   * ember-cli-build.js, matching the v1 API.
   */
  buildBabelPlugin(options = {}) {
    const { buildBabelPlugin } = require('./dist/babel/index.js');
    return buildBabelPlugin(options);
  },

  /**
   * Register the template coverage AST plugin so `.hbs` templates in
   * classic and Embroider builds get branch coverage. Strict-mode
   * templates (`.gjs`/`.gts`) are handled by the Babel plugin instead.
   */
  setupPreprocessorRegistry(type, registry) {
    if (base.setupPreprocessorRegistry) {
      base.setupPreprocessorRegistry.call(this, type, registry);
    }

    if (type !== 'parent' || !this._coverageEnabled()) {
      return;
    }

    const { getConfig } = require('./dist/core/config.js');
    const config = getConfig(this._configPath());

    if (!config.templateCoverage) {
      return;
    }

    // The wrapper carries its own parallel-rebuild instructions, so the
    // build stays parallelizable under `throwUnlessParallelizable`.
    const { buildWrapper } = require('./glimmer-plugin.cjs');

    registry.add(
      'htmlbars-ast-plugin',
      buildWrapper({ coverageEnvVar: config.coverageEnvVar }),
    );
  },

  /**
   * Attach the coverage endpoint to the express server behind
   * `ember serve`. A fresh coverage map per request keeps repeated
   * dev-server runs from accumulating stale data.
   */
  serverMiddleware(startOptions) {
    if (!this._coverageEnabled()) return;

    this._attachMiddleware(startOptions.app, { resetOnRequest: true });
  },

  /**
   * Attach the coverage endpoint to the testem server behind
   * `ember test`. Coverage accumulates across requests so split test
   * runs land in one report.
   */
  testemMiddleware(app) {
    if (!this._coverageEnabled()) return;

    // `ember test --server` reuses the dev server semantics.
    if (process.argv.includes('--server') || process.argv.includes('-s')) {
      return this.serverMiddleware({ app });
    }

    this._attachMiddleware(app, { resetOnRequest: false });
  },

  /**
   * Register the `coverage-merge` command with ember-cli.
   */
  includedCommands() {
    return {
      'coverage-merge': {
        name: 'coverage-merge',
        description: 'Merge coverage from parallel test runs',
        works: 'insideProject',
        async run() {
          const { mergeCoverage } = require('./dist/merge/index.js');
          await mergeCoverage({
            root: this.project.root,
            configPath: path.join(this.project.root, 'config'),
          });
        },
      },
    };
  },

  _root() {
    return this.project?.root ?? process.cwd();
  },

  _configPath() {
    // `project.configPath()` points at config/environment; getConfig()
    // resolves coverage.js from its directory.
    if (this.project?.configPath) {
      return this.project.configPath();
    }

    return path.join(this._root(), 'config');
  },

  /**
   * Honour a project-defined `coverageEnvVar` rather than hardcoding
   * COVERAGE, so `config/coverage.js` stays authoritative.
   */
  _coverageEnabled() {
    const { getConfig, isCoverageEnabled } = require('./dist/core/config.js');
    return isCoverageEnabled(getConfig(this._configPath()));
  },

  _attachMiddleware(app, { resetOnRequest }) {
    const { coverageMiddleware } = require('./dist/testem/index.js');

    coverageMiddleware({
      root: this._root(),
      configPath: this._configPath(),
      // Vite emits absolute filesystem paths in `window.__coverage__`, so
      // the namespace remapping classic builds need would double-prefix
      // them and drop every file from the report.
      namespaceMappings: this._isViteProject()
        ? null
        : this._buildNamespaceMappings(),
      resetOnRequest,
    })(app);
  },

  /**
   * Detect a Vite-driven host project. `ember test --path dist` still
   * runs through testem, so this hook is where Vite apps get their
   * coverage endpoint — the Vite plugin's dev-server middleware is not
   * running at that point.
   */
  _isViteProject() {
    const pkg = this.project?.pkg;
    if (!pkg) return false;

    return Boolean(
      pkg.dependencies?.['@embroider/vite'] ||
      pkg.devDependencies?.['@embroider/vite'],
    );
  },

  /**
   * Map runtime module namespaces back to on-disk directories by walking
   * the ember-cli project tree. This has to happen here rather than in
   * `core` because only ember-cli knows the resolved addon graph.
   */
  _buildNamespaceMappings() {
    const mappings = new Map();

    const recurse = (item) => {
      if (item.isEmberCLIProject && item.isEmberCLIProject()) {
        const projectConfig = item.config(process.env.EMBER_ENV);
        mappings.set(projectConfig.modulePrefix, path.join(item.root, 'app'));
      } else if (item.treePaths) {
        const moduleName = item.moduleName();
        mappings.set(moduleName, path.join(item.root, item.treePaths.addon));
        mappings.set(
          path.join(moduleName, 'test-support'),
          path.join(item.root, item.treePaths['addon-test-support']),
        );
      }

      (item.addons ?? []).forEach(recurse);
    };

    recurse(this.project);

    // A "default" lookup for namespace-less paths. Under Embroider the
    // stage 2 workspace may be either /tmp/embroider/hash/app.js or
    // /tmp/embroider/hash/app-name/app.js.
    const projectNamespace = this.parent?.isEmberCLIProject?.()
      ? 'app'
      : 'addon';
    mappings.set('/', path.join(this.project.root, projectNamespace));

    return mappings;
  },
};
