#!/usr/bin/env node
'use strict';

/**
 * Standalone `coverage-merge` command.
 *
 * The ember-cli command (`ember coverage-merge`) does the same thing —
 * this exists for projects that drive testing without ember-cli, e.g. a
 * Vite app that runs `ember test --path dist` only for the test runner
 * and has no other use for the ember-cli command layer.
 *
 * Usage:
 *   coverage-merge [--root <dir>] [--config <dir-or-file>]
 *
 * With no flags, behaves exactly like `ember coverage-merge`: root
 * defaults to the current working directory, and config resolves to
 * `<root>/config/coverage.js` if present.
 */

const path = require('node:path');

function parseArgs(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--root') {
      options.root = argv[++i];
    } else if (arg === '--config') {
      options.configPath = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      process.stderr.write(`coverage-merge: unrecognized argument '${arg}'\n`);
      process.exitCode = 1;
      options.help = true;
    }
  }

  return options;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: coverage-merge [--root <dir>] [--config <dir-or-file>]',
      '',
      'Merges coverage-final.json files from parallel test runs',
      '(directories matching <coverageFolder>_*) into one report.',
      '',
      '  --root    Project root directory (default: cwd)',
      '  --config  Path to coverage config directory or file',
      '            (default: <root>/config)',
      '',
    ].join('\n'),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const root = options.root ? path.resolve(options.root) : process.cwd();
  const configPath = options.configPath
    ? path.resolve(options.configPath)
    : path.join(root, 'config');

  const { mergeCoverage } = require('../dist/merge/index.js');

  await mergeCoverage({ root, configPath });
}

main().catch((err) => {
  process.stderr.write(`coverage-merge: ${err.message}\n`);
  process.exitCode = 1;
});
