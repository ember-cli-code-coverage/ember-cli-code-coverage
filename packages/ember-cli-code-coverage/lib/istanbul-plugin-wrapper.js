'use strict';

/**
 * Wrapper for babel-plugin-istanbul that provides _parallelBabel metadata
 * so the plugin can be used with ember-cli-babel's throwUnlessParallelizable.
 *
 * broccoli-babel-transpiler requires plugins to either be serializable or
 * have a _parallelBabel property that tells workers how to reconstruct them.
 * babel-plugin-istanbul doesn't provide this, so we wrap it.
 *
 * buildFromParallelApiInfo calls: buildIstanbulPlugin(params)
 * The return value is used as the plugin entry in the Babel plugins array.
 * We return [pluginFunction, opts] so Babel gets the standard tuple format.
 */
function buildIstanbulPlugin(opts) {
  let istanbulPlugin = require('babel-plugin-istanbul');
  // Handle both CJS default export and ESM interop
  let plugin = istanbulPlugin.default || istanbulPlugin;
  return [plugin, opts];
}

module.exports = { buildIstanbulPlugin };
