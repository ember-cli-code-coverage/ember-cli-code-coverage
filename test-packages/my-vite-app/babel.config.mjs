import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  babelCompatSupport,
  templateCompatSupport,
} from '@embroider/compat/babel';
import templateCoverageImportPlugin from 'ember-cli-code-coverage/babel/template-coverage-import-plugin';
import { createTemplateCoveragePlugin } from 'ember-cli-code-coverage/glimmer';

export default {
  plugins: [
    // Must come before babel-plugin-ember-template-compilation below: it
    // injects the coverageInit/coverageMark/coverageCond imports that
    // plugin's own scope validation checks for when compiling a
    // strict-mode <template>.
    templateCoverageImportPlugin,
    [
      'babel-plugin-ember-template-compilation',
      {
        enableLegacyModules: [
          'ember-cli-htmlbars',
          'ember-cli-htmlbars-inline-precompile',
          'htmlbars-inline-precompile',
        ],
        transforms: [
          ...templateCompatSupport(),
          createTemplateCoveragePlugin({ strict: true }),
        ],
      },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: fileURLToPath(
            import.meta.resolve('decorator-transforms/runtime-esm'),
          ),
        },
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        absoluteRuntime: dirname(fileURLToPath(import.meta.url)),
        useESModules: true,
        regenerator: false,
      },
    ],
    ...babelCompatSupport(),
  ],

  generatorOpts: {
    compact: false,
  },
};
