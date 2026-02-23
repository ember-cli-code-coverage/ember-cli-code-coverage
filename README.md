# ember-cli-code-coverage

[![npm version](https://badge.fury.io/js/ember-cli-code-coverage.svg)](http://badge.fury.io/js/ember-cli-code-coverage)
[![CI](https://github.com/kategengler/ember-cli-code-coverage/workflows/CI/badge.svg)](https://github.com/kategengler/ember-cli-code-coverage/actions?query=workflow%3ACI)

Code coverage using [Istanbul](https://github.com/gotwarlost/istanbul) for Ember apps. Supports classic builds, Embroider, and Vite.

## Requirements

* Node.js >= 18

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
    plugins: [...require('ember-cli-code-coverage').buildBabelPlugin({ embroider: true })],
    sourceMaps: 'inline',
  },
});
```

**Vite apps** (`vite.config.mjs`) using `@rollup/plugin-babel`:

```js
import { buildBabelPlugin } from 'ember-cli-code-coverage/babel';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  plugins: [
    babel({
      plugins: [...buildBabelPlugin()],
      extensions: ['.js', '.ts', '.gjs', '.gts'],
    }),
  ],
});
```

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

### 2. Add coverage middleware

The middleware receives coverage data POSTed from the browser and writes reports.

**Ember CLI apps** (automatic):

The addon automatically attaches middleware when used with `ember test` or `ember serve`. No additional setup needed.

**Vite apps** (`vite.config.mjs`):

```js
import { coveragePlugin } from 'ember-cli-code-coverage/vite';

export default defineConfig({
  plugins: [
    coveragePlugin(),
  ],
});
```

**Custom testem** (`testem.cjs`):

```js
const { coverageMiddleware } = require('ember-cli-code-coverage/testem');

module.exports = {
  middleware: [coverageMiddleware({ root: __dirname })],
};
```

### 3. Add browser-side helpers

In your test helper, force-load all modules and send coverage data after tests complete.

**`tests/test-helper.js`**:

```js
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import QUnit from 'qunit';

QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});
```

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
};
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `coverageEnvVar` | `'COVERAGE'` | Environment variable that enables coverage |
| `reporters` | `['lcov', 'html']` | Istanbul reporters. `json-summary` is always added. Supports `[name, options]` tuples. |
| `excludes` | `['*/mirage/**/*']` | Globs to exclude from instrumentation |
| `extension` | `['.gjs', '.gts', '.js', '.ts', ...]` | File extensions to instrument |
| `coverageFolder` | `'coverage'` | Output directory (relative to project root) |
| `parallel` | `false` | Enable parallel-safe output with random suffixes |
| `modifyAssetLocation` | — | Custom function to override file path resolution |

## Subpath exports

The package provides focused entry points for each concern:

| Import | Purpose |
|--------|---------|
| `ember-cli-code-coverage` | Main entry — re-exports everything |
| `ember-cli-code-coverage/babel` | `buildBabelPlugin()` |
| `ember-cli-code-coverage/testem` | Testem/Express middleware |
| `ember-cli-code-coverage/vite` | Vite plugin |
| `ember-cli-code-coverage/browser` | Browser-side helpers (`forceModulesToBeLoaded`, `sendCoverage`) |
| `ember-cli-code-coverage/test-support` | Alias for `./browser` |
| `ember-cli-code-coverage/merge` | `mergeCoverage()` for parallel runs |

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
