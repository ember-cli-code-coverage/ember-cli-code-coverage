/* eslint-env node */

module.exports = {
  // Vite hands absolute filesystem paths to the instrumenter, so these
  // globs are depth-independent rather than module-namespaced.
  excludes: ['**/node_modules/**', '**/mirage/**'],
  reporters: ['lcov', 'html', 'text', 'json-summary'],
};
