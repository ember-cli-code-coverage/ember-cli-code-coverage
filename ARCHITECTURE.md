# Architecture

This document describes the modular architecture of `ember-cli-code-coverage` v3.

For usage examples and configuration options, see [README.md](./README.md).

## Modular Entry Points

v3 exposes separate entry points for each concern:

| Import Path | Purpose |
|-------------|---------|
| `ember-cli-code-coverage` | Main entry |
| `ember-cli-code-coverage/babel` | Babel plugin for JS/TS instrumentation |
| `ember-cli-code-coverage/vite` | Vite plugin for coverage |
| `ember-cli-code-coverage/istanbul` | Coverage utilities and report generation |
| `ember-cli-code-coverage/testem` | Testem middleware |
| `ember-cli-code-coverage/glimmer` | Template coverage types (future) |
| `ember-cli-code-coverage/test-support` | Browser-side helpers |

All modules ship with hand-written TypeScript declarations. Import types directly:

```typescript
import type { BabelPluginOptions } from 'ember-cli-code-coverage/babel';
import type { VitePluginOptions } from 'ember-cli-code-coverage/vite';
import type { CoverageConfig } from 'ember-cli-code-coverage/istanbul';
```

## How Coverage Works

Code coverage follows a two-phase process:

### Phase 1: Instrumentation (Build Time)

Istanbul inserts coverage counters into source code via a Babel plugin. When instrumented code executes, it populates `window.__coverage__` with statement, branch, and function hit counts.

For classic ember-cli and Embroider builds, `buildBabelPlugin()` configures the Istanbul Babel plugin.
For Vite builds, `coveragePlugin()` applies Istanbul instrumentation via Vite's `transform` hook.

### Phase 2: Collection (Test Time)

After tests complete, `window.__coverage__` data is sent to a server endpoint (`POST /write-coverage`) which transforms paths using source maps and generates reports (HTML, LCOV, JSON).

For ember-cli, this endpoint is provided by Testem middleware.
For Vite, it is provided by the server plugin via Vite's `configureServer` hook.

## Module API Reference

### `ember-cli-code-coverage/babel`

| Export | Description |
|--------|-------------|
| `buildBabelPlugin(opts?: BabelPluginOptions)` | Returns Babel plugins for Istanbul instrumentation |
| `createIstanbulPlugin(opts: IstanbulPluginConfig)` | Returns the Istanbul Babel plugin tuple |
| `createGjsGtsIgnorePlugin()` | Returns path to the GJS/GTS ignore plugin |

**Options (`BabelPluginOptions`):**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cwd` | `string` | `process.cwd()` | Working directory for path resolution |
| `exclude` | `string[]` | `['*/mirage/**/*', '*/node_modules/**/*']` | Glob patterns to exclude from instrumentation |
| `extensions` | `string[]` | `['.gjs', '.gts', '.js', '.ts', '.cjs', '.mjs', '.mts', '.cts']` | File extensions to instrument |
| `coverageEnvVar` | `string` | `'COVERAGE'` | Environment variable that enables coverage |
| `configPath` | `string` | `'config'` | Path to coverage config directory |
| `embroider` | `boolean` | `false` | Whether running under Embroider |
| `templateCoverage` | `boolean` | `false` | When true, skips the GJS/GTS ignore plugin |

### `ember-cli-code-coverage/vite`

| Export | Description |
|--------|-------------|
| `coveragePlugin(opts?: VitePluginOptions)` | Returns Vite plugins for instrumentation + collection |
| `instrumentationPlugin(opts?: VitePluginOptions)` | Vite transform hook for Istanbul instrumentation |
| `coverageServerPlugin(opts?: VitePluginOptions)` | Vite dev server middleware for `/write-coverage` |
| `getTemplateCoverageTransforms()` | Template coverage AST transforms (stub) |

**Options (`VitePluginOptions`):**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `process.env.COVERAGE === 'true'` | Enable coverage |
| `coverageEnvVar` | `string` | `'COVERAGE'` | Environment variable to check |
| `exclude` | `string[]` | `['**/node_modules/**', '**/tests/**', '**/mirage/**']` | Glob patterns to exclude |
| `extensions` | `string[]` | `['.js', '.ts', '.gjs', '.gts', '.mjs', '.mts']` | File extensions to instrument |
| `templateCoverage` | `boolean` | `false` | Enable template branch coverage (requires `/glimmer`) |
| `coverage` | `Partial<CoverageConfig>` | `{}` | Overrides `reporters` and `coverageFolder` for report generation |

### `ember-cli-code-coverage/istanbul`

| Export | Description |
|--------|-------------|
| `loadConfig(configPath)` | Load coverage config from `config/coverage.js` |
| `getDefaultConfig()` | Returns default coverage configuration |
| `createCoverageMap(data?)` | Creates an Istanbul coverage map |
| `generateReports(map, opts)` | Generates coverage reports |
| `mergeCoverageMaps(maps)` | Merges multiple coverage maps |
| `transformCoverageWithSourceMaps(coverage, store?)` | Remaps coverage using source maps |
| `createSourceMapStore()` | Creates an Istanbul source map store |
| `createReport(reporter)` | Creates a single Istanbul report |
| `createCoverageMergeCommand()` | Returns the `ember coverage-merge` command object |

**`CoverageConfig`** (returned by `getDefaultConfig()`, loaded by `loadConfig()` from `config/coverage.js`):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `coverageEnvVar` | `string` | `'COVERAGE'` | Environment variable that enables coverage |
| `coverageFolder` | `string` | `'coverage'` | Directory to write coverage reports to |
| `excludes` | `string[]` | `['*/mirage/**/*']` | Glob patterns to exclude |
| `reporters` | `string[]` | `['html', 'lcov']` | Coverage reporters |
| `parallel` | `boolean` | `false` | Enable parallel mode (appends random suffix to folder) |
| `modifyAssetLocation` | `Function` | `undefined` | Custom function to modify coverage file paths |

### `ember-cli-code-coverage/testem`

| Export | Description |
|--------|-------------|
| `serverMiddleware(app: Express, config: MiddlewareConfig)` | Express middleware for `ember serve` (fresh map per request) |
| `testMiddleware(app: Express, config: MiddlewareConfig)` | Express middleware for `ember test` (accumulates coverage) |
| `createViteTestemMiddleware(opts?: ViteTestemMiddlewareOptions)` | Creates testem middleware for Vite projects |

**Config (`MiddlewareConfig`):** (for `serverMiddleware`/`testMiddleware`)

| Field | Type | Description |
|-------|------|-------------|
| `root` | `string` | Project root directory |
| `configPath` | `string` | Path to coverage config |
| `namespaceMappings` | `Map<string, string>` | Module-to-path namespace mappings |

**Options (`ViteTestemMiddlewareOptions`):** (for `createViteTestemMiddleware`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | `string` | `process.cwd()` | Project root directory |
| `coverageFolder` | `string` | `'coverage'` | Coverage output folder |
| `reporters` | `string[]` | `['html', 'lcov', 'json-summary']` | Coverage reporters |

### `ember-cli-code-coverage/test-support`

| Export | Description |
|--------|-------------|
| `sendCoverage(callback?)` | POSTs `window.__coverage__` to `/write-coverage` |
| `forceModulesToBeLoaded(filterFn?)` | Forces evaluation of all registered modules |

### `ember-cli-code-coverage/glimmer`

| Export | Description |
|--------|-------------|
| `coverageAstTransform(opts?: GlimmerPluginOptions)` | Glimmer AST transform for template coverage (stub) |
| `setupPreprocessorRegistry(type, registry)` | Registers AST plugin with ember-cli (stub) |

Template coverage is not yet implemented. These exports provide types and stubs for forward compatibility.

## Package Structure

```
packages/ember-cli-code-coverage/
├── lib/                        # JavaScript source (CJS) with JSDoc annotations
│   ├── index.js                # Main entry (re-exports)
│   ├── istanbul/               # Coverage utilities
│   │   ├── index.js
│   │   ├── config.js
│   │   ├── merge.js
│   │   └── reports.js
│   ├── babel/                  # Babel plugins
│   │   ├── index.js
│   │   └── gjs-gts-ignore-plugin.js
│   ├── glimmer/                # Template coverage stubs
│   │   └── index.js
│   ├── testem/                 # Testem middleware
│   │   ├── index.js
│   │   ├── middleware.js
│   │   ├── vite-middleware.js
│   │   └── utils.js
│   └── vite/                   # Vite plugin
│       ├── index.js
│       ├── instrumentation.js
│       └── server.js
├── types/                      # Hand-written TypeScript declarations
│   ├── index.d.ts
│   ├── istanbul.d.ts
│   ├── babel.d.ts
│   ├── glimmer.d.ts
│   ├── testem.d.ts
│   ├── vite.d.ts
│   └── test-support.d.ts
├── index.js                    # Ember addon entry point
├── addon-test-support/         # Browser helpers (ESM)
└── package.json
```

No build step is required. The `lib/` folder contains plain JavaScript (CommonJS) that Node.js 20+ can import directly.
ESM consumers (e.g., `vite.config.mjs`) can use named imports from CJS modules thanks to Node.js's automatic interop.
