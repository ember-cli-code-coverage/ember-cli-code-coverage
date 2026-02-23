# How To Contribute

## Installation

```bash
git clone <repository-url>
cd ember-cli-code-coverage
pnpm install
```

## Project Structure

This is a **pnpm workspace monorepo** with the following layout:

- `packages/ember-cli-code-coverage/` — The main addon (TypeScript source in `src/`)
- `test-packages/` — Integration tests and fixture apps

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

> **Note:** Integration tests create temporary fixture projects, install
> dependencies, and run `ember test`. They have a 10-minute timeout and
> require a working internet connection.

## Development Workflow

1. Make changes in `packages/ember-cli-code-coverage/src/`
2. Run `pnpm build` in the package directory
3. Run tests from the workspace root: `pnpm test`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
