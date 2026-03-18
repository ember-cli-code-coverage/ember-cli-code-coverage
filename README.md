# ember-cli-code-coverage

[![npm version](https://badge.fury.io/js/ember-cli-code-coverage.svg)](http://badge.fury.io/js/ember-cli-code-coverage)
[![CI](https://github.com/kategengler/ember-cli-code-coverage/workflows/CI/badge.svg)](https://github.com/kategengler/ember-cli-code-coverage/actions?query=workflow%3ACI)

Code coverage using [Istanbul](https://github.com/gotwarlost/istanbul) for Ember apps.

## Requirements
* If using Mocha, Testem `>= 1.6.0` for which you need ember-cli `> 2.4.3`
* If using Mirage you need `ember-cli-mirage >= 0.1.13`
* If using Pretender (even as a dependency of Mirage) you need `pretender >= 0.11.0`
* If using Mirage or Pretender, you need to [set up a passthrough for coverage to be written](#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests).
* `ember-cli-babel >= 6.0.0`


## Installation

* `ember install ember-cli-code-coverage`

## Setup

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

tests/test-helpers.js:
```js
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import Qunit from 'qunit';

QUnit.done(async function() {
  forceModulesToBeLoaded();
  await sendCoverage();
});
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

## TypeScript integration

Steps:

* in `tsconfig.json`
```js
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
      sourceMaps: 'inline'
    },
    sourcemaps: {
      enabled: true,
      extensions: ['js']
    }
  });
```
* in `package.json` specify latest available version
```js
  {
    devDependencies: {
      "ember-cli-code-coverage": "^2.1.0",
    }
  }
```
## ember-template-imports integration

* in `ember-cli-build.js`
```js
  const app = new EmberApp(defaults, {
    'ember-template-imports': {
      inline_source_map: true,
    },
  });
```

## Template Coverage

This addon supports branch coverage for Glimmer/Handlebars templates (`.hbs` files and `<template>` tags in `.gjs`/`.gts` files). When `COVERAGE=true`, templates are automatically instrumented during compilation to track which branches are executed.

### What is tracked

- **Block conditionals**: `{{#if}}`, `{{#unless}}` (with and without `{{else}}`)
- **Inline conditionals**: `{{if condition "yes" "no"}}`, `(if condition "a" "b")`, and the `unless` equivalents
- **List branches**: `{{#each}}`/`{{#each-in}}` with `{{else}}` (items vs empty list)
- **Chained conditionals**: `{{else if}}` chains
- **Named blocks (slots)**: `<:header>`, `<:body>`, `<:footer>`, etc. -- tracks whether each named block was rendered
- **Default blocks**: `<MyComponent>content</MyComponent>` -- tracks whether the implicit default block content was rendered. Components are detected by uppercase tags, dotted paths (`<foo.bar>`), `@`-prefixed arguments (`<my-thing @value={{1}}>`), or block params (`<my-thing as |item|>`)

### How it works

A Glimmer AST plugin runs at build time and:
1. Injects `{{coverageInit}}` at the template root to register an Istanbul-compatible coverage object in `window.__coverage__`
2. Injects `{{coverageMark}}` at the start of each block branch body to record block branch hits
3. Wraps inline conditional conditions with `(coverageCond)` to record inline branch hits reactively

The coverage data integrates seamlessly with the existing Istanbul pipeline, appearing in the same HTML/LCOV/JSON reports alongside JavaScript coverage.

### Setup for .hbs files

No additional setup is needed. The AST plugin is registered automatically via `setupPreprocessorRegistry` when the addon is installed. Branch coverage for `.hbs` files works out of the box.

### Setup for .gjs/.gts files (strict mode)

For `.gjs`/`.gts` files using `<template>` tags, coverage helpers need to be in JavaScript scope. The `buildBabelPlugin()` method already includes a Babel plugin that injects the necessary imports automatically. No extra configuration is required if you already have `buildBabelPlugin()` in your `ember-cli-build.js`.

### Manual setup for babel-plugin-ember-template-compilation

If you configure `babel-plugin-ember-template-compilation` directly (e.g., in Embroider v2 apps), you can add the AST plugin as a transform:

```js
// babel.config.js or similar
const coverage = require('ember-cli-code-coverage');

module.exports = {
  plugins: [
    // Coverage babel plugins (includes import injection for .gjs/.gts)
    ...coverage.buildBabelPlugin({ embroider: true }),

    // Template compilation with coverage AST transform
    ['babel-plugin-ember-template-compilation', {
      transforms: [
        ...coverage.buildTemplateCoveragePlugin(),
        // ...other transforms
      ],
    }],
  ],
};
```

### Example

Given this template:
```hbs
{{#if @isLoggedIn}}
  <p>Welcome, {{@user.name}}!</p>
{{else}}
  <p>Please log in.</p>
{{/if}}

<div class={{if @isActive "active" "inactive"}}>
  {{#each @items as |item|}}
    {{item.name}}
  {{else}}
    No items found.
  {{/each}}
</div>

<PageLayout>
  <:header>My App</:header>
  <:sidebar>Navigation</:sidebar>
  <:body>Main content</:body>
</PageLayout>

<Modal @isOpen={{@showModal}}>
  <p>This is the default block content</p>
</Modal>
```

The coverage report will show:
- Branch 0 (`if`): whether `@isLoggedIn` was truthy and/or falsy
- Branch 1 (`cond`): whether `@isActive` was truthy and/or falsy (inline conditional)
- Branch 2 (`each`): whether `@items` had items and/or was empty
- Branch 3 (`named-block`): whether `<:header>` was rendered
- Branch 4 (`named-block`): whether `<:sidebar>` was rendered
- Branch 5 (`named-block`): whether `<:body>` was rendered
- Branch 6 (`default-block`): whether `<Modal>` rendered its default block content

## V8 Compat Mode

By default, this addon uses `babel-plugin-istanbul` to instrument all JS/TS files at build time. As an alternative, you can use **V8 compat mode** to skip Istanbul instrumentation entirely and rely on Chrome's built-in V8 code coverage for JS/TS files, while still using the template AST plugin for `.hbs` branch coverage.

This is useful when you pair this addon with a V8 coverage collector like [`testem-code-coverage`](https://github.com/NullVoxPopuli/testem-code-coverage).

### Benefits

- **Faster builds** -- no Babel instrumentation pass for JS/TS files
- **More accurate JS coverage** -- V8 bytecode-level coverage has no instrumentation side effects
- **Template branch coverage preserved** -- the Glimmer AST plugin still instruments `{{#if}}`, `{{#unless}}`, inline `(if)`, named blocks, etc.

### Setup

1. Install a V8 coverage collector (e.g., `testem-code-coverage`)
2. Pass `v8: true` to `buildBabelPlugin()`:

```js
// ember-cli-build.js
let app = new EmberApp(defaults, {
  babel: {
    plugins: [
      ...require('ember-cli-code-coverage').buildBabelPlugin({ v8: true }),
    ],
  },
});
```

3. Configure your V8 collector (see its docs for Testem integration)

### How it works

In V8 compat mode, `buildBabelPlugin({ v8: true })` returns only the template coverage import plugin (for `.gjs`/`.gts` strict-mode support). It does **not** include `babel-plugin-istanbul` or the Istanbul ignore plugin.

The coverage data flows from two sources:
- **JS/TS files**: V8/CDP coverage collected externally, converted to Istanbul format by your V8 collector
- **Template files** (`.hbs`, `<template>` in `.gjs`/`.gts`): Branch coverage from the AST plugin, written to `window.__coverage__` and sent via `/write-coverage`

Both produce Istanbul-format output keyed by file path, so they merge cleanly in the final report.

### Limitations

- V8 coverage only works in **Chromium-based browsers** (Chrome, Edge). Firefox and Safari are not supported.
- V8 coverage reports against compiled/bundled JS. Source map quality affects accuracy.
- Template branch coverage still requires this addon's AST plugin and runtime helpers.

## Configuration

Configuration is optional. It should be put in a file at `config/coverage.js` (`configPath` configuration in package.json is honored). In addition to this you can configure Istanbul by adding a `.istanbul.yml` file to the root directory of your app (See https://github.com/gotwarlost/istanbul#configuring)

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

## Create a passthrough when intercepting all ajax requests in tests

To work, this addon has to post coverage results back to a middleware at `/write-coverage`.

If you are using [`ember-cli-mirage`](http://www.ember-cli-mirage.com) you should add the following:

```
// in mirage/config.js

  this.passthrough('/write-coverage');
  this.namespace = 'api';  // It's important that the passthrough for coverage is before the namespace, otherwise it will be prefixed.
```

If you are using [`ember-cli-pretender`](https://github.com/rwjblue/ember-cli-pretender) you should add the following:

```
// where ever you set up the Pretender Server

  var server = new Pretender(function () {
    this.post('/write-coverage', this.passthrough);
  });
```

## Advanced customization

### `forceModulesToBeLoaded`

The `forceModulesToBeLoaded` function can potentially cause unintended side effects when executed. You can pass custom filter fuctions that allow
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

## Inspiration

This addon was inspired by [`ember-cli-blanket`](https://github.com/sglanzer/ember-cli-blanket).
The primary differences are that this addon uses Istanbul rather than Blanket for coverage and it instruments your application code as part of the build, when enabled.
