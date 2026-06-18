# ember-cli-code-coverage

[![npm version](https://badge.fury.io/js/ember-cli-code-coverage.svg)](http://badge.fury.io/js/ember-cli-code-coverage)
[![CI](https://github.com/ember-cli-code-coverage/ember-cli-code-coverage/workflows/CI/badge.svg)](https://github.com/ember-cli-code-coverage/ember-cli-code-coverage/actions?query=workflow%3ACI)

Code coverage using [Istanbul](https://github.com/istanbuljs/istanbuljs) for Ember apps and addons.
Supports classic Ember CLI, Embroider, and Vite-based builds.

## Requirements

* Node.js >= 20

The following apply to **classic ember-cli / Embroider builds only** (not Vite):

* `ember-cli-babel >= 6.0.0`
* If using Mocha, Testem `>= 1.6.0` for which you need ember-cli `> 2.4.3`
* If using Mirage you need `ember-cli-mirage >= 0.1.13`
* If using Pretender (even as a dependency of Mirage) you need `pretender >= 0.11.0`
* If using Mirage or Pretender, you need to [set up a passthrough for coverage to be written](#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests).

## Installation

* `ember install ember-cli-code-coverage`

Or with npm/pnpm:

```bash
npm install --save-dev ember-cli-code-coverage
# or
pnpm add -D ember-cli-code-coverage
```

## Setup

### Classic Ember CLI apps

In order to gather code coverage information, you must first install the Babel plugins in each project that you'd like to have instrumented.

For classic apps (ember-cli-build.js):

```js
let app = new EmberApp(defaults, {
  babel: {
    plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
  },
});
```

For embroider apps (ember-cli-build.js):

```js
let app = new EmberApp(defaults, {
  babel: {
    plugins: [...require('ember-cli-code-coverage').buildBabelPlugin({ embroider: true })],
  },
});
```

For in-repo and standalone addons (index.js):

```js
module.exports = {
  name: require('./package').name,

  options: {
    babel: {
      plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
    },
  },
};
```

For in-repo engines (index.js):

```js
module.exports = EngineAddon.extend({
  // ...
  included() {
    this._super.included.apply(this, arguments);
    this.options.babel.plugins.push(...require('ember-cli-code-coverage').buildBabelPlugin());
  },
});
```

For `app` files in standalone addons (ember-cli-build.js):

```js
let app = new EmberAddon(defaults, {
  babel: {
    plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()]
  },
});
```

Add the following to your existing `tests/test-helper.js`:

```js
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import * as QUnit from 'qunit';

QUnit.done(async function() {
  forceModulesToBeLoaded();
  await sendCoverage();
});
```

### v2 Embroider addons (Rollup-based)

For v2 Embroider native addons based on https://github.com/embroider-build/addon-blueprint blueprint:

```js
// babel.config.cjs
module.exports = {
  plugins: [
    ['@babel/plugin-transform-typescript', { allExtensions: true, onlyRemoveTypeImports: true, allowDeclareFields: true }],
    '@embroider/addon-dev/template-colocation-plugin',
    ['babel-plugin-ember-template-compilation', { targetFormat: 'hbs', transforms: [] }],
    ['module:decorator-transforms', { runtime: 'globals' }],
    ...require('ember-cli-code-coverage').buildBabelPlugin(),
  ],
};
```

Coverage is collected by the test app test suite, so the app
must set up `tests/test-helper.js` with `sendCoverage()` as shown in the
[Classic Ember CLI apps](#classic-ember-cli-apps) or
[Vite-based apps and addons](#vite-based-apps-and-addons) sections.

### Vite-based apps and addons

For projects using `@embroider/vite`, add the coverage plugin to your Vite config.

#### For Vite apps

This matches the [ember-app-blueprint vite.config.mjs](https://github.com/ember-cli/ember-app-blueprint/blob/main/files/vite.config.mjs):

```js
// vite.config.mjs
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
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
```

No manual middleware wiring is needed — the addon auto-detects `@embroider/vite`
and registers coverage middleware for you. See
[coverage collection under `vite build` + Testem](#test-helper-teststest-helperjs-or-teststest-helperts)
for details and the manual override pattern.

#### For Vite addons

This matches the [ember-addon-blueprint vite.config.mjs](https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/vite.config.mjs):

```js
// vite.config.mjs
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { coveragePlugin } from 'ember-cli-code-coverage/vite';

// For scenario testing
const isCompat = Boolean(process.env.ENABLE_COMPAT_BUILD);
const enableCoverage = process.env.COVERAGE === 'true';

export default defineConfig({
  plugins: [
    ...(isCompat ? [classicEmberSupport()] : []),
    ember(),
    ...(enableCoverage ? coveragePlugin() : []),
    babel({
      babelHelpers: 'inline',
      extensions,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        tests: 'tests/index.html',
      },
    },
  },
});
```

And the matching `testem.cjs`:

```js
// testem.cjs
'use strict';

const { createViteTestemMiddleware } = require('ember-cli-code-coverage/testem');

if (typeof module !== 'undefined') {
  module.exports = {
    test_page: 'tests/index.html?hidepassed',
    cwd: 'dist-tests',
    disable_watching: true,
    launch_in_ci: ['Chrome'],
    launch_in_dev: ['Chrome'],
    browser_args: {
      Chrome: {
        ci: [
          process.env.CI ? '--no-sandbox' : null,
          '--headless',
          '--disable-dev-shm-usage',
          '--mute-audio',
          '--remote-debugging-port=0',
          '--window-size=1440,900',
        ].filter(Boolean),
      },
    },
    middleware: [createViteTestemMiddleware()],
  };
}
```

#### `coveragePlugin()` options

The `coveragePlugin()` function accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `process.env.COVERAGE === 'true'` | Force-enable or force-disable coverage; falls back to checking `coverageEnvVar`. |
| `coverageEnvVar` | `string` | `'COVERAGE'` | Environment variable that, when set to `'true'`, enables coverage. |
| `exclude` | `string[]` | `['**/node_modules/**', '**/tests/**', '**/mirage/**']` | Glob patterns to skip during instrumentation. |
| `extensions` | `string[]` | `['.js', '.ts', '.gjs', '.gts', '.mjs', '.mts']` | File extensions to instrument. |
| `templateCoverage` | `boolean` | `false` | Reserved for template branch coverage (requires the `/glimmer` module — **not yet implemented**). |
| `coverage` | `object` | `{}` | Overrides for report generation: `{ reporters, coverageFolder }`. |

Example overriding only what you need. Note that `exclude` is a **full replacement** — repeat the defaults you want to keep:

```js
coveragePlugin({
  exclude: [
    '**/node_modules/**',
    '**/tests/**',
    '**/mirage/**',
    '**/vendor/**',
  ],
  coverage: {
    reporters: ['html', 'lcov', 'json-summary'],
    coverageFolder: 'coverage',
  },
});
```

#### Test helper (`tests/test-helper.js` or `tests/test-helper.ts`)

Instrumentation records hits in `window.__coverage__`, but reports are only written after the browser **POSTs** that payload to `/write-coverage`.
Wire that up from [`ember-cli-code-coverage/test-support`](https://github.com/ember-cli-code-coverage/ember-cli-code-coverage/tree/master/packages/ember-cli-code-coverage/addon-test-support) in **`tests/test-helper.js`** or **`tests/test-helper.ts`** (same pattern for either extension).

The following matches [ember-app-blueprint `tests/test-helper.ts`](https://github.com/ember-cli/ember-app-blueprint/blob/main/files/tests/test-helper.ts), with coverage hooks added. **Apps and addons** both use this pattern.

```js
// tests/test-helper.js — replace `my-app` with your package name / modulePrefix
import Application from 'my-app/app';
import config from 'my-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.done(async function () {
    try {
      forceModulesToBeLoaded();
    } catch (_e) {
      // Vite serves ESM; requirejs is not available — safe to ignore
    }
    await sendCoverage();
  });

  qunitStart();
}
```

If you use **`vite build` + Testem** (output to `dist-tests` or `dist`), the Vite dev server's `configureServer` hook from `coveragePlugin()` only runs under **`vite dev`**, not during a production-style test build. For this case the addon automatically detects `@embroider/vite` in your project's `package.json` and registers `createViteTestemMiddleware()` for you via its `testemMiddleware` hook — no extra `testem.cjs` configuration is required.

If you need to customize the middleware (e.g. point at a different project root or change the report output folder), you can register it manually from `testem.cjs`:

```js
// testem.cjs
'use strict';

const { createViteTestemMiddleware } = require('ember-cli-code-coverage/testem');

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  cwd: 'dist-tests',
  // ... other testem config
  middleware: [
    createViteTestemMiddleware({
      root: process.cwd(),                         // Project root (default: process.cwd())
      coverageFolder: 'coverage',                  // Output folder (default: 'coverage')
      reporters: ['html', 'lcov', 'json-summary'], // Reporter list (default shown)
    }),
  ],
};
```

Run with coverage enabled:

```bash
COVERAGE=true npm run test
# or
COVERAGE=true pnpm test
```

## Usage

Coverage will only be generated when an [environment variable](https://en.wikipedia.org/wiki/Environment_variable) is true (by default `COVERAGE`) and running your test command like normal.

For example:

`COVERAGE=true ember test`

If you want your coverage to work on both Unix and Windows, you can do this:

`npm install cross-env --save-dev`

and then:

`cross-env COVERAGE=true ember test`

When running with `parallel` set to true, the final reports can be merged by using `ember coverage-merge`. The final merged output will be stored in the `coverageFolder`.

If you intend to use `ember test` with the `--path` flag, you should generate the build
with `coverageEnvVar` set as true. This is because the code is instrumented for
coverage during the build.

For example:

`COVERAGE=true ember build --environment=test --output-path=dist`

followed by

`COVERAGE=true ember test --path=dist`

## TypeScript integration (classic ember-cli / Embroider)

For Vite-based projects, TypeScript is handled natively by Vite/esbuild — no
extra source-map configuration is required. The steps below apply only to
classic ember-cli / Embroider builds.

Steps:

* in `tsconfig.json`
```json
{
  "compilerOptions": {
    "inlineSourceMap": true,
    "inlineSources": true
  }
}
```
* in `ember-cli-build.js`
```js
const app = new EmberApp(defaults, {
  babel: {
    sourceMaps: 'inline',
  },
  sourcemaps: {
    enabled: true,
    extensions: ['js'],
  },
});
```
* in `package.json`, use the latest 3.x release of `ember-cli-code-coverage`.

> v3 ships hand-written TypeScript declarations for all public entry points
> (`/babel`, `/vite`, `/istanbul`, `/testem`, `/test-support`, `/glimmer`).
> See [ARCHITECTURE.md](./ARCHITECTURE.md#module-api-reference) for the full
> typed API.

## ember-template-imports integration

* in `ember-cli-build.js`
```js
  const app = new EmberApp(defaults, {
    'ember-template-imports': {
      inline_source_map: true,
    },
  });
```

## Configuration

> **Note:** `config/coverage.js` is read by the **classic** Ember CLI /
> Embroider build pipeline only. The **Vite** plugin
> (`ember-cli-code-coverage/vite`) does **not** load `config/coverage.js`;
> configure it inline via `coveragePlugin({ ... })` options. See the
> [mapping table below](#mapping-configcoveragejs--vite-options) and the
> [Vite-based apps and addons](#vite-based-apps-and-addons) section.

Configuration is optional. It should be put in a file at `config/coverage.js` (`configPath` configuration in package.json is honored). In addition to this you can configure Istanbul by adding a `.istanbul.yml` file to the root directory of your app (See https://github.com/istanbuljs/istanbuljs)

#### Options

- `coverageEnvVar`: Defaults to `COVERAGE`. This is the environment variable that when set will cause coverage metrics to be generated.

- `reporters`: Defaults to `['lcov', 'html']`. The `json-summary` reporter will
  be added to anything set here, it is required. This can be any [reporters
  supported by
  Istanbul](https://github.com/gotwarlost/istanbul/tree/master/lib/report).
  Reporters can be configured with array-style syntax, for example, here are
  options to `lcov` with a different `projectRoot`: `[['lcov', { projectRoot:
  '/packages/addon' }], 'html']`

- `excludes`: Defaults to `['*/mirage/**/*']`. An array of globs to exclude from instrumentation. Useful to exclude files from coverage statistics.

- `extension`: Defaults to `['.gjs', '.gts', '.js', '.ts', '.cjs', '.mjs', '.mts', '.cts']`. Tell Istanbul to instrument only files with the provided extensions.

- `coverageFolder`: Defaults to `coverage`. A folder relative to the root of your project to store coverage results.

- `parallel`: Defaults to `false`. Should be set to true if parallel testing is being used for separate test runs, for example when using [ember-exam](https://github.com/trentmwillis/ember-exam) with the `--partition` flag. This will generate the coverage reports in directories suffixed with `_<random_string>` to avoid overwriting other threads reports. These reports can be joined by using the `ember coverage-merge` command (potentially as part of the [posttest hook](https://docs.npmjs.com/misc/scripts) in your `package.json`).

- `modifyAssetLocation`: Optional function that will allow you to override where a file actually lives inside of your project. See [Advanced customization](#modifyassetlocation) on how to use this function in practice.

#### Example
```js
  module.exports = {
    coverageEnvVar: 'COV'
  }
```

#### `buildBabelPlugin()` options

`buildBabelPlugin()` accepts an optional object. Most users don't need to pass
anything — the function reads `config/coverage.js` automatically. These
options are only useful when you need to override the defaults programmatically
(e.g. in `ember-cli-build.js` or `babel.config.cjs`):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cwd` | `string` | `process.cwd()` | Working directory for path resolution and `config/coverage.js` lookup. |
| `embroider` | `boolean` | `false` | Set to `true` for Embroider apps so the plugin resolves the rewritten-app working directory. |
| `templateCoverage` | `boolean` | `false` | When `true`, skips the GJS/GTS ignore plugin (reserved for future template coverage). |

Values from `config/coverage.js` (`excludes`, `coverageEnvVar`, `extension`)
take precedence over the built-in defaults when the file exists. The function
returns `[]` when the coverage env var is not `'true'`.

#### Mapping `config/coverage.js` → Vite options

For Vite-based projects, translate each `config/coverage.js` key to its
`coveragePlugin()` equivalent:

| `config/coverage.js`         | Vite equivalent (in `vite.config.mjs`)                            |
|------------------------------|-------------------------------------------------------------------|
| `coverageEnvVar`             | `coveragePlugin({ coverageEnvVar: 'COV' })`                       |
| `reporters`                  | `coveragePlugin({ coverage: { reporters: [...] } })`              |
| `coverageFolder`             | `coveragePlugin({ coverage: { coverageFolder: '...' } })`         |
| `excludes` (note: plural)    | `coveragePlugin({ exclude: [...] })` (note: singular)             |
| `extension`                  | `coveragePlugin({ extensions: [...] })` (note: plural)            |
| `parallel`                   | _not yet supported in the Vite pipeline_                          |
| `modifyAssetLocation`        | _not applicable — Vite emits absolute paths and uses source maps_ |

## Create a passthrough when intercepting all ajax requests in tests

To work, this addon has to post coverage results back to a middleware at `/write-coverage`.

If you are using [`ember-cli-mirage`](http://www.ember-cli-mirage.com) you should add the following:

```js
// in mirage/config.js

  this.passthrough('/write-coverage');
  this.namespace = 'api';  // It's important that the passthrough for coverage is before the namespace, otherwise it will be prefixed.
```

If you are using [`ember-cli-pretender`](https://github.com/rwjblue/ember-cli-pretender) you should add the following:

```js
// where ever you set up the Pretender Server

  var server = new Pretender(function () {
    this.post('/write-coverage', this.passthrough);
  });
```

## Advanced customization

### `forceModulesToBeLoaded`

The `forceModulesToBeLoaded` function can potentially cause unintended side effects when executed. You can pass custom filter functions that allow
you to specify which modules will be force loaded or not:

```js
QUnit.done(async () => {
  // type will be either webpack and/or require
  forceModulesToBeLoaded((type, moduleName) => { return true; });
  await sendCoverage();
});
```

### `modifyAssetLocation`

Under the hood, `ember-cli-code-coverage` attempts to "de-namespacify" paths into their real on disk location inside of
`project.root` (ie give a namespaced path like lib/inrepo/components/foo.js would live in lib/inrepo/addon/components/foo.js). It makes
some assumptions (where files live in in-repo addons vs app code for example) and sometimes those assumptions might not hold. Passing a
function `modifyAssetLocation` in your [configuration file](#configuration) will allow you to override where a file actually lives inside
of your project. The returned string should be relative to your project root.

```js
module.exports = {
  modifyAssetLocation(root, relativePath) {
    let appPath = relativePath.replace('my-project-name', 'app');

    // here is an example of saying that `app/components/foo.js` actually
    // lives in `lib/inrepo/app/components/foo.js` on disk.
    if (fs.existsSync(path.join(root, 'lib', 'inrepo', appPath))) {
      return path.join('lib', 'inrepo', appPath);
    }

    return false;
  },
};
```

## Migration from v2 to v3

### Breaking Changes

- **Node.js >= 20** is now required (was >= 18)
- Code has been reorganized into `lib/` with modular entry points

### What Still Works

The main entry point is fully backward compatible. If your setup looks like this, no changes are needed:

```js
// ember-cli-build.js -- unchanged
const { buildBabelPlugin } = require('ember-cli-code-coverage');
```

```js
// test-helper.js -- unchanged
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
```

### New: Modular Imports

v3 adds dedicated entry points for each concern. You can optionally use them for more explicit imports:

```js
// Instead of:
const { buildBabelPlugin } = require('ember-cli-code-coverage');

// You can now also do:
const { buildBabelPlugin } = require('ember-cli-code-coverage/babel');
```

### New: Vite Support

If you are migrating to Vite (via `@embroider/vite`), replace the ember-cli Babel plugin setup with the Vite plugin:

```js
// vite.config.mjs
import { coveragePlugin } from 'ember-cli-code-coverage/vite';

export default defineConfig({
  plugins: [
    ember(),
    ...(process.env.COVERAGE === 'true' ? coveragePlugin() : []),
    babel({ extensions }), // see "Vite-based apps and addons" for babelHelpers
  ],
});
```

Coverage collection happens automatically, via one of two paths depending on
how you run tests:

- Under `vite dev`, the `coveragePlugin()` registers a Vite server middleware
  at `POST /write-coverage` (Vite's `configureServer` hook).
- Under `vite build` + `ember test` (or any Testem-driven flow), the addon
  detects `@embroider/vite` in your `package.json` and auto-registers
  `createViteTestemMiddleware()` on the Testem express app via its
  `testemMiddleware` hook.

In both cases you do not need to wire any middleware manually. See
[Vite-based apps and addons](#vite-based-apps-and-addons) for the full
config (including the project-specific `babelHelpers` value) and for the
manual override pattern.

### New: TypeScript Types

All modules ship hand-written TypeScript declarations. Import types directly:

```typescript
import type { BabelPluginOptions } from 'ember-cli-code-coverage/babel';
import type { VitePluginOptions } from 'ember-cli-code-coverage/vite';
import type { CoverageConfig } from 'ember-cli-code-coverage/istanbul';
```

## Inspiration

This addon was inspired by [`ember-cli-blanket`](https://github.com/sglanzer/ember-cli-blanket).
The primary differences are that this addon uses Istanbul rather than Blanket for coverage and it instruments your application code as part of the build, when enabled.
