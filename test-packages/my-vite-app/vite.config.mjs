import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { coveragePlugin } from 'ember-cli-code-coverage/vite';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // Instruments with Istanbul and serves /write-coverage in dev.
    // A no-op unless COVERAGE=true.
    ...coveragePlugin(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
