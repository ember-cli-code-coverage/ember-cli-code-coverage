'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    babel: {
      plugins: [
        ...require('ember-cli-code-coverage').buildBabelPlugin({
          embroider: true,
        }),
      ],
      sourceMaps: 'inline',
    },
    'ember-cli-babel': {
      throwUnlessParallelizable: true,
    },
    'ember-template-imports': {
      inline_source_map: true,
    },
    sourcemaps: {
      enabled: true,
      extensions: ['js'],
    },
  });

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: true,
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
