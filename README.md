# ember-cli-code-coverage

[![npm version](https://badge.fury.io/js/ember-cli-code-coverage.svg)](http://badge.fury.io/js/ember-cli-code-coverage)
[![CI](https://github.com/kategengler/ember-cli-code-coverage/workflows/CI/badge.svg)](https://github.com/kategengler/ember-cli-code-coverage/actions?query=workflow%3ACI)

Code coverage using [Istanbul](https://github.com/gotwarlost/istanbul) for Ember apps. Supports classic builds, Embroider, and Vite.

## Requirements

- Node.js >= 22

## Installation

```shell
pnpm add -D ember-cli-code-coverage
# or
npm install --save-dev ember-cli-code-coverage
```

## Setup

### 1. Add Babel instrumentation plugin

The Babel plugin instruments your code with Istanbul coverage markers during the build.

**Classic apps** (`ember-cli-build.js`):

```js
let app = new EmberApp(defaults, {
  babel: {
    plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
    sourceMaps: 'inline',
  },
});
```

**Embroider apps** (`ember-cli-build.js`):

```js
let app = new EmberApp(defaults, {
  babel: {
    plugins: [
      ...require('ember-cli-code-coverage').buildBabelPlugin({
        embroider: true,
      }),
    ],
    sourceMaps: 'inline',
  },
});
```

**Vite apps**: skip this step. `coveragePlugin()` instruments your code itself
(see below), so you do not add the Babel plugin to `@rollup/plugin-babel`.

**V1 addons** (`index.js`):

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

**V2 addons** (`babel.config.cjs`):

```js
const { buildBabelPlugin } = require('ember-cli-code-coverage/babel');

module.exports = {
  plugins: [...buildBabelPlugin()],
};
```

### 2. Add coverage collection

The browser POSTs coverage data to `/write-coverage`, and whatever is serving
the app writes the reports.

**Ember CLI apps** (automatic):

The addon attaches the middleware itself for `ember test` and `ember serve`.
Nothing to configure. `ember serve` and `ember test --server` start a fresh
coverage map per request; `ember test` accumulates across requests so split
runs land in one report.

**Vite apps** (`vite.config.mjs`):

```js
import { defineConfig } from 'vite';
import { classicEmberSupport, ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { coveragePlugin } from 'ember-cli-code-coverage/vite';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    ...coveragePlugin(),
    babel({ babelHelpers: 'runtime', extensions }),
  ],
});
```

`coveragePlugin()` returns an array and expands to nothing unless coverage is
enabled, so it is safe to leave in place. It instruments modules after Ember's
own transforms have run, which is why `.gjs` and `.gts` files come out correct.

Ember tests a Vite app against a built bundle:

```bash
COVERAGE=true vite build --mode development
COVERAGE=true ember test --path dist
```

At that point the Vite dev server is not running, so the addon's testem
middleware serves `/write-coverage` instead. That happens automatically when
`@embroider/vite` is a dependency of your app.

**Custom testem** (`testem.cjs`):

```js
const { coverageMiddleware } = require('ember-cli-code-coverage/testem');

module.exports = {
  middleware: [coverageMiddleware({ root: __dirname })],
};
```

For a Vite app with a hand-written testem config, use `viteTestemMiddleware`
instead. It skips the module-namespace remapping that classic builds need,
which would otherwise drop every file from the report:

```js
const { viteTestemMiddleware } = require('ember-cli-code-coverage/testem');

module.exports = {
  middleware: [viteTestemMiddleware({ root: __dirname })],
};
```

### 3. Add browser-side helpers

In your test helper, force-load all modules and send coverage data after tests complete.

**`tests/test-helper.js`**:

```js
import {
  forceModulesToBeLoaded,
  sendCoverage,
} from 'ember-cli-code-coverage/test-support';
import QUnit from 'qunit';

QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});
```

`forceModulesToBeLoaded()` walks the AMD and Webpack module registries so that
files no test imported still report at 0% instead of vanishing. Vite builds have
no such registry, so the call is a harmless no-op there; the Vite plugin records
a zero-filled baseline at build time to cover the same gap.

## Usage

Coverage is only generated when an environment variable is set (default: `COVERAGE`).

```bash
COVERAGE=true ember test
```

Cross-platform:

```bash
npx cross-env COVERAGE=true ember test
```

### Parallel testing

When running with `parallel` set to true in config, use `ember coverage-merge` to combine reports:

```bash
COVERAGE=true ember exam --split=2 --parallel=true
ember coverage-merge
```

### Pre-built test output

```bash
COVERAGE=true ember build --environment=test --output-path=dist
COVERAGE=true ember test --path=dist
```

## Template coverage

Istanbul only sees JavaScript, so by default a `{{#if}}` that never takes its
`{{else}}` branch is invisible in the report. Turn on `templateCoverage` in
`config/coverage.js` to measure template branches too:

```js
module.exports = {
  templateCoverage: true,
};
```

An AST plugin then rewrites each template at build time to report which paths
it took, and those branches show up in the same HTML and LCOV reports as your
JavaScript, keyed by the template's own path.

What is measured:

| Construct                                    | Reported as                                        |
| -------------------------------------------- | -------------------------------------------------- |
| `{{#if}}` / `{{#unless}}`                    | Two paths, whether or not an `{{else}}` is written |
| `{{else if}}` chains                         | One branch per link in the chain                   |
| `{{#each}}` / `{{#each-in}}` with `{{else}}` | Items path and empty path                          |
| `{{if x a b}}` / `{{unless x a b}}`          | Two paths, including in attribute position         |

Blocks that always render their body, such as `{{#let}}` and `{{#in-element}}`,
introduce no branch and are left alone. Templates with no branches at all are
not instrumented and do not appear in the report.

No extra setup is needed for classic or Embroider builds: the addon registers
the AST plugin itself, and the helpers it relies on reach your app through the
addon's app tree.

### Strict-mode templates (`.gjs`/`.gts`)

A loose-mode `.hbs` template resolves helpers by name through Ember's classic
resolver. A strict-mode template — the `<template>` tag in `.gjs`/`.gts`, or a
whole app built with [`ember-strict-application-resolver`][strict-resolver],
which has no classic resolver at all — has none of that: every reference has
to be an existing JS binding. Getting branch coverage there needs two things
instead of just `templateCoverage: true`:

```js
// vite.config.mjs
import { coveragePlugin } from 'ember-cli-code-coverage/vite';
// ...
export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    ...coveragePlugin(),
    babel({ babelHelpers: 'runtime', extensions }),
  ],
});
```

```js
// babel.config.mjs
import { templateCompatSupport } from '@embroider/compat/babel';
import templateCoverageImportPlugin from 'ember-cli-code-coverage/babel/template-coverage-import-plugin';
import { createTemplateCoveragePlugin } from 'ember-cli-code-coverage/glimmer';

export default {
  plugins: [
    // Must come before babel-plugin-ember-template-compilation below: it
    // injects the coverageInit/coverageMark/coverageCond imports that
    // plugin's scope validation checks for.
    templateCoverageImportPlugin,
    [
      'babel-plugin-ember-template-compilation',
      {
        transforms: [
          ...templateCompatSupport(),
          createTemplateCoveragePlugin({ strict: true }),
        ],
      },
    ],
    // ...
  ],
};
```

`strict: true` switches the plugin from dash-cased helper references
(`coverage-mark`, resolved by name) to camelCase ones (`coverageMark`,
resolved as a JS binding) — a dash isn't a valid identifier character, so the
two forms can't be shared. `templateCoverageImportPlugin` is what supplies
those bindings: it detects a file with a strict-mode template and adds the
three helper imports before `babel-plugin-ember-template-compilation` compiles
it, which is also why it has to run first in the plugins array.

Both plugins already no-op when coverage is disabled, so it's safe to leave
this wiring in place permanently.

By default, only files under `process.cwd()` are instrumented — pass `root` to
`createTemplateCoveragePlugin()` to override it. This matters because a
`transforms` array isn't scoped to your own app: Embroider rewrites a classic
v1 addon dependency into a v2-compatible `template()` call through this same
array as part of its compat step, and that dependency never went through
`templateCoverageImportPlugin`, so instrumenting it would reference helpers
with no binding to resolve against.

This wiring is verified for Vite apps; a classic or Embroider app using
`.gjs`/`.gts` would need the same babel config (a v2 addon already
hand-authors one), but that combination hasn't been tested here.

[strict-resolver]: https://github.com/ember-cli/ember-strict-application-resolver

## Configuration

Configuration is optional. Place it in `config/coverage.js`:

```js
module.exports = {
  coverageEnvVar: 'COVERAGE',
  reporters: ['lcov', 'html'],
  excludes: ['*/mirage/**/*'],
  extension: ['.gjs', '.gts', '.js', '.ts', '.cjs', '.mjs', '.mts', '.cts'],
  coverageFolder: 'coverage',
  parallel: false,
  templateCoverage: false,
};
```

### Options

| Option                | Default                               | Description                                                                            |
| --------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `coverageEnvVar`      | `'COVERAGE'`                          | Environment variable that enables coverage                                             |
| `reporters`           | `['lcov', 'html']`                    | Istanbul reporters. `json-summary` is always added. Supports `[name, options]` tuples. |
| `excludes`            | `['*/mirage/**/*']`                   | Globs to exclude from instrumentation                                                  |
| `extension`           | `['.gjs', '.gts', '.js', '.ts', ...]` | File extensions to instrument                                                          |
| `coverageFolder`      | `'coverage'`                          | Output directory (relative to project root)                                            |
| `parallel`            | `false`                               | Enable parallel-safe output with random suffixes                                       |
| `templateCoverage`    | `false`                               | Report branch coverage for `.hbs` templates                                            |
| `modifyAssetLocation` | —                                     | Custom function to override file path resolution                                       |

## Subpath exports

The package provides focused entry points for each concern:

| Import                                 | Purpose                                                         |
| -------------------------------------- | --------------------------------------------------------------- |
| `ember-cli-code-coverage`              | Main entry — re-exports everything                              |
| `ember-cli-code-coverage/babel`        | `buildBabelPlugin()`                                            |
| `ember-cli-code-coverage/testem`       | Testem/Express middleware                                       |
| `ember-cli-code-coverage/vite`         | Vite plugin                                                     |
| `ember-cli-code-coverage/browser`      | Browser-side helpers (`forceModulesToBeLoaded`, `sendCoverage`) |
| `ember-cli-code-coverage/test-support` | Alias for `./browser`                                           |
| `ember-cli-code-coverage/glimmer`      | `createTemplateCoveragePlugin()` for template coverage          |
| `ember-cli-code-coverage/merge`        | `mergeCoverage()` for parallel runs                             |

## TypeScript integration

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "inlineSourceMap": true,
    "inlineSources": true
  }
}
```

In `ember-cli-build.js`:

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

## ember-template-imports integration

In `ember-cli-build.js`:

```js
const app = new EmberApp(defaults, {
  'ember-template-imports': {
    inline_source_map: true,
  },
});
```

## Passthrough for intercepted requests

If you intercept all AJAX requests in tests (Mirage, Pretender), add a passthrough for `/write-coverage`:

**Mirage** (`mirage/config.js`):

```js
this.passthrough('/write-coverage');
this.namespace = 'api';
```

**Pretender**:

```js
var server = new Pretender(function () {
  this.post('/write-coverage', this.passthrough);
});
```

## Advanced

### Custom module filter

```js
QUnit.done(async () => {
  forceModulesToBeLoaded((type, moduleName) => true);
  await sendCoverage();
});
```

### `modifyAssetLocation`

Override file path resolution in `config/coverage.js`:

```js
module.exports = {
  modifyAssetLocation(root, relativePath) {
    let appPath = relativePath.replace('my-project-name', 'app');
    if (fs.existsSync(path.join(root, 'lib', 'inrepo', appPath))) {
      return path.join('lib', 'inrepo', appPath);
    }
    return false;
  },
};
```

## Inspiration

Inspired by [`ember-cli-blanket`](https://github.com/sglanzer/ember-cli-blanket). This addon uses Istanbul and instruments your application code at build time.
