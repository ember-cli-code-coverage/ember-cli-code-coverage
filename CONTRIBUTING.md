# How To Contribute

## Installation

```bash
git clone <repository-url>
cd ember-cli-code-coverage
pnpm install
```

## Project Structure

This is a **pnpm workspace monorepo** with the following layout:

- `packages/ember-cli-code-coverage/` — the addon
- `test-packages/` — tests and fixture apps

Inside the addon, the Node-side code is TypeScript compiled to `dist/`:

| Path           | Runs in | Purpose                                                       |
| -------------- | ------- | ------------------------------------------------------------- |
| `src/core/`    | Node    | Shared pipeline: config, path mapping, source maps, reports   |
| `src/babel/`   | Node    | Istanbul instrumentation for classic and Embroider builds     |
| `src/vite/`    | Node    | Instrumentation and dev-server endpoint for Vite builds       |
| `src/testem/`  | Node    | `/write-coverage` endpoint for `ember test` and `ember serve` |
| `src/glimmer/` | Node    | AST plugin that instruments `.hbs` templates                  |
| `src/merge/`   | Node    | `ember coverage-merge` for parallel runs                      |
| `src/browser/` | Browser | `sendCoverage`, `forceModulesToBeLoaded`                      |
| `runtime/`     | Browser | Template coverage helpers, authored as ESM and shipped as-is  |
| `_app_/`       | Browser | App-tree re-exports that make those helpers resolvable        |

`runtime/` and `_app_/` deliberately skip the TypeScript build: they are
browser modules pulled into a consuming app's tree, so they must stay ESM.
Every path listed in `ember-addon.app-js` also has to appear in `exports`,
or Embroider refuses to resolve it.

## Building

```bash
cd packages/ember-cli-code-coverage
pnpm build          # Compile TypeScript to dist/
```

## Linting

```bash
pnpm lint           # Run ESLint across the workspace
pnpm lint:fix       # Auto-fix lint issues
```

## Running Tests

Tests use [Vitest](https://vitest.dev/) and run from the workspace root:

```bash
pnpm test           # Run the full test suite
```

Individual test files can be targeted:

```bash
pnpm vitest test-packages/my-app-test.mjs
```

There are two kinds of test. The fast ones exercise a plugin directly and
finish in milliseconds:

```bash
pnpm vitest test-packages/template-coverage-plugin-test.mjs
pnpm vitest test-packages/template-coverage-runtime-test.mjs
pnpm vitest test-packages/gjs-gts-ignore-template-plugin-test.mjs
```

The rest copy a fixture app to a temp directory and run a real build, which
takes minutes each. Each fixture covers one build shape:

| Fixture                                 | Covers                                                         |
| --------------------------------------- | -------------------------------------------------------------- |
| `my-app`                                | Classic build, parallel runs, custom excludes, prebuilt output |
| `my-embroider-app`                      | Embroider build                                                |
| `my-embroider-app-template-imports`     | Embroider with `.gjs` template imports                         |
| `my-app-template-coverage`              | Classic build with `templateCoverage` on                       |
| `my-vite-app`                           | Vite build, plus the build-time coverage baseline              |
| `my-v1-addon`, `scoped-v1-addon`        | v1 addon namespaces, including scoped                          |
| `my-v2-addon-gjs-gts`                   | v2 addon with `.gjs`/`.gts` sources                            |
| `my-app-with-in-repo-addon`             | In-repo addon paths and `modifyAssetLocation`                  |
| `my-app-with-custom-path-in-repo-addon` | In-repo addon in a non-standard directory                      |
| `my-app-with-in-repo-engine`            | In-repo engine                                                 |

> **Note:** Integration tests create temporary fixture projects, install
> dependencies, and run `ember test`. They have a 10-minute timeout and
> require a working internet connection.

### Adding a fixture

Fixture apps are workspace members, so a new one needs `pnpm install` at the
root before its test can run. Depend on the addon with `workspace:*`, and
wire it up the way a real consumer would — the point of these tests is that
the documented setup works.

## Development Workflow

1. Make changes in `packages/ember-cli-code-coverage/src/`
2. Run `pnpm build` in the package directory
3. Run tests from the workspace root: `pnpm test`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
