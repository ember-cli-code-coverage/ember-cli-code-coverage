'use strict';

const { buildBabelPlugin } = require('./babel/index.js');

/**
 * Main entry point for ember-cli-code-coverage.
 *
 * Only `buildBabelPlugin` is re-exported here for backward compatibility.
 * For other utilities, import from the specific modules:
 *
 * - `ember-cli-code-coverage/babel` - Babel plugin utilities
 * - `ember-cli-code-coverage/istanbul` - Coverage map and report utilities
 * - `ember-cli-code-coverage/testem` - Testem middleware
 * - `ember-cli-code-coverage/vite` - Vite plugin
 * - `ember-cli-code-coverage/glimmer` - Template coverage (stub)
 * - `ember-cli-code-coverage/test-support` - Browser-side helpers
 */
module.exports = {
  buildBabelPlugin,
};
