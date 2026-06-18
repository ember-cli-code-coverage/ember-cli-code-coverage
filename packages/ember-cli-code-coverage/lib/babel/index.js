'use strict';

const path = require('path');
const fs = require('fs-extra');

/**
 * @typedef {Object} BabelPluginOptions
 * @property {string} [cwd]
 * @property {string[]} [exclude]
 * @property {string[]} [extensions]
 * @property {string} [coverageEnvVar]
 * @property {string} [configPath]
 * @property {boolean} [embroider]
 * @property {boolean} [templateCoverage] - When true, skips the GJS/GTS ignore plugin
 */

/**
 * Get path to the GJS/GTS ignore plugin
 * @returns {string}
 */
function createGjsGtsIgnorePlugin() {
  return path.resolve(__dirname, 'gjs-gts-ignore-plugin.js');
}

/**
 * Create the Istanbul babel plugin tuple
 * @param {Object} options
 * @param {string} options.cwd
 * @param {string} options.include
 * @param {string[]} options.exclude
 * @param {string[]} options.extension
 * @returns {[string, object]}
 */
function createIstanbulPlugin(options) {
  const IstanbulPlugin = require.resolve('babel-plugin-istanbul');
  return [IstanbulPlugin, options];
}

/**
 * Build Babel plugins for Istanbul instrumentation
 * @param {BabelPluginOptions} [opts]
 * @returns {any[]}
 */
function buildBabelPlugin(opts = {}) {
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

  const pkgJSON = fs.readJsonSync(path.join(cwd, 'package.json'));

  if (pkgJSON['ember-addon'] && pkgJSON['ember-addon'].configPath) {
    configBase = pkgJSON['ember-addon'].configPath;
  }

  if (fs.existsSync(path.join(cwd, configBase, 'coverage.js'))) {
    const config = require(path.join(cwd, configBase, 'coverage.js'));

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

  if (opts.embroider === true) {
    try {
      // Attempt to import the utility @embroider/compat uses in >3.1 to locate the embroider working directory
      // the presence of this `locateEmbroiderWorkingDir` method coincides with the shift to utilize `rewritten-app` tmp dir
      const { locateEmbroiderWorkingDir } = require('@embroider/core');
      cwd = path.resolve(locateEmbroiderWorkingDir(cwd), 'rewritten-app');
    } catch (_err) {
      // otherwise, fall back to the method used in embroider <3.1
      const {
        stableWorkspaceDir,
      } = require('@embroider/compat/src/default-pipeline');
      cwd = stableWorkspaceDir(cwd, process.env.EMBER_ENV);
    }
  }

  const IstanbulPlugin = require.resolve('babel-plugin-istanbul');
  const plugins = [];

  if (!opts.templateCoverage) {
    plugins.push(path.resolve(__dirname, 'gjs-gts-ignore-plugin.js'));
  }

  plugins.push([IstanbulPlugin, { cwd, include: '**/*', exclude, extension }]);

  return plugins;
}

module.exports = {
  buildBabelPlugin,
  createIstanbulPlugin,
  createGjsGtsIgnorePlugin,
};
