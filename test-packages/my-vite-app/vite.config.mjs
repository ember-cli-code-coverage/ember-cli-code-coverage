import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { coveragePlugin } from 'ember-cli-code-coverage/vite';

const enableCoverage = process.env.COVERAGE === 'true';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    ...(enableCoverage ? coveragePlugin() : []),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
