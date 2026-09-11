'use strict';

/**
 * Parallel-safe wrapper for the template coverage AST plugin.
 *
 * broccoli-babel-transpiler compiles templates in worker processes and
 * cannot serialize a plugin function. ember-cli-htmlbars rebuilds each
 * plugin in the worker by requiring a file and calling a named export,
 * which must return the whole registry wrapper — not just the plugin.
 *
 * This file is that target. It is deliberately tiny and side-effect free,
 * unlike `addon-main.cjs`, which builds the entire addon when loaded.
 *
 * @see https://github.com/babel/broccoli-babel-transpiler#parallel-transpilation
 */
module.exports.buildWrapper = function buildWrapper(params = {}) {
  const { createTemplateCoveragePlugin } = require('./dist/glimmer/index.js');

  const parallelBabel = {
    requireFile: __filename,
    buildUsing: 'buildWrapper',
    params,
  };

  return {
    name: 'ember-cli-code-coverage',
    plugin: createTemplateCoveragePlugin(params),

    // Present on the rebuilt wrapper too, so the worker can rebuild again.
    parallelBabel,

    baseDir() {
      return __dirname;
    },

    cacheKey() {
      return `ember-cli-code-coverage:${params.coverageEnvVar || 'COVERAGE'}`;
    },
  };
};
