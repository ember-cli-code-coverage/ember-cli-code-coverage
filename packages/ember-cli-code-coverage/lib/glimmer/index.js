'use strict';

/**
 * @typedef {Object} GlimmerPluginOptions
 * @property {boolean} [enabled]
 * @property {string} [coverageEnvVar]
 */

/**
 * @typedef {Object} TemplateCoverageData
 * @property {string} path
 * @property {Object.<string, {type: string, locations: any[], line: number}>} branchMap
 * @property {Object.<string, number[]>} b
 */

/**
 * Returns a Glimmer AST transform for template branch coverage.
 *
 * NOTE: This is a stub. Template coverage instrumentation is not yet implemented.
 * The types and export signature are provided for forward compatibility.
 *
 * @param {GlimmerPluginOptions} [_options]
 * @returns {any[]}
 */
function coverageAstTransform(/* options */) {
  console.warn(
    'ember-cli-code-coverage: Template coverage is not yet implemented. ' +
      'The coverageAstTransform() function currently returns an empty transform.'
  );
  return [];
}

/**
 * Register the coverage AST plugin with ember-cli's preprocessor registry.
 *
 * NOTE: This is a stub. Template coverage instrumentation is not yet implemented.
 *
 * @param {string} _type
 * @param {any} _registry
 */
function setupPreprocessorRegistry(/* type, registry */) {
  // No-op stub - template coverage not yet implemented
}

module.exports = {
  coverageAstTransform,
  setupPreprocessorRegistry,
};
