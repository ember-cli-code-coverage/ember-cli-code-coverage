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
 * - testem middleware hook for coverage collection
 * - coverage-merge command for parallel test runs
 *
 * Consumers must still manually configure:
 * - Babel plugin in ember-cli-build.js
 * - Browser helpers in tests/test-helper.js
 */
const base = addonV1Shim(__dirname);

module.exports = {
  ...base,

  /**
   * Register the coverage middleware with testem.
   * Called by ember-cli during `ember test`.
   */
  testemMiddleware(app) {
    if (process.env.COVERAGE !== 'true') return;

    const { coverageMiddleware } = require('./dist/testem/index.js');
    const root = this.project?.root ?? process.cwd();
    const middleware = coverageMiddleware({
      root,
      configPath: path.join(root, 'config'),
    });
    middleware(app);
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
};
