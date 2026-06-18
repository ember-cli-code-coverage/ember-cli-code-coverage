'use strict';

const DEFAULT_EXTENSIONS = ['.js', '.ts', '.gjs', '.gts', '.mjs', '.mts'];
const DEFAULT_EXCLUDES = ['**/node_modules/**', '**/tests/**', '**/mirage/**'];

/**
 * Convert glob pattern to regex
 * @param {string} glob
 * @returns {RegExp}
 */
function globToRegex(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '<<GLOBSTAR>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<GLOBSTAR>>/g, '.*');
  return new RegExp(escaped);
}

/**
 * Check if a file should be instrumented
 * @param {string} id
 * @param {string[]} extensions
 * @param {string[]} exclude
 * @returns {boolean}
 */
function shouldInstrument(id, extensions, exclude) {
  const hasMatchingExtension = extensions.some((ext) => id.endsWith(ext));
  if (!hasMatchingExtension) return false;

  for (const pattern of exclude) {
    const regex = globToRegex(pattern);
    if (regex.test(id)) return false;
  }

  return true;
}

/**
 * Create Vite instrumentation plugin
 * @param {Object} [options]
 * @param {string[]} [options.extensions]
 * @param {string[]} [options.exclude]
 * @returns {import('vite').Plugin}
 */
function instrumentationPlugin(options = {}) {
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  const exclude = options.exclude ?? DEFAULT_EXCLUDES;
  let babelTransformSync = null;
  let istanbulPluginPath = null;

  return {
    name: 'ember-coverage-instrumentation',
    enforce: 'post',

    async buildStart() {
      try {
        istanbulPluginPath = require.resolve('babel-plugin-istanbul');
      } catch (err) {
        console.warn(
          'ember-cli-code-coverage: Could not find babel-plugin-istanbul:',
          err.message
        );
        return;
      }

      try {
        // eslint-disable-next-line node/no-unpublished-require
        const babel = require('@babel/core');
        babelTransformSync = babel.transformSync;
      } catch (err) {
        console.warn(
          'ember-cli-code-coverage: Could not load @babel/core:',
          err.message
        );
      }
    },

    transform(code, id) {
      if (!babelTransformSync || !istanbulPluginPath) return null;
      if (!shouldInstrument(id, extensions, exclude)) return null;

      try {
        const result = babelTransformSync(code, {
          filename: id,
          babelrc: false,
          configFile: false,
          plugins: [
            [
              istanbulPluginPath,
              {
                cwd: process.cwd(),
                include: '**/*',
                exclude,
                extension: extensions,
              },
            ],
          ],
          sourceMaps: true,
        });

        if (result && result.code) {
          return {
            code: result.code,
            map: result.map,
          };
        }
      } catch (err) {
        console.warn(
          `ember-cli-code-coverage: Failed to instrument ${id}: ${err.message}`
        );
      }

      return null;
    },
  };
}

module.exports = { instrumentationPlugin };
