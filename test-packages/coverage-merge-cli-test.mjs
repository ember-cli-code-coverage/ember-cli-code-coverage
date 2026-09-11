'use strict';

import fs from 'fs-extra';
import { execa } from 'execa';
import setupTestDir, {
  assertCoverageExists,
  assertDirDoesNotExist,
} from './utils.mjs';
import { describe, it } from 'vitest';

const APP_DIR = 'my-app';
const APP_PATH = `test-packages/${APP_DIR}`;

const CLI_BIN = `${process.cwd()}/packages/ember-cli-code-coverage/bin/coverage-merge.js`;

describe('standalone coverage-merge CLI', function () {
  it('merges parallel coverage without going through ember-cli', async function () {
    const env = { COVERAGE: 'true' };
    const buildPath = await setupTestDir(APP_DIR, env, {});

    fs.copySync(
      `${APP_PATH}/config/-coverage-parallel.js`,
      `${buildPath}/config/coverage.js`,
    );

    await execa('pnpm', ['ember', 'exam', '--split=2', '--parallel=true'], {
      cwd: buildPath,
      env,
    });
    await assertDirDoesNotExist(`${buildPath}/coverage`);

    // No `ember`, no `pnpm run`: just the bin script, the way a project
    // with no ember-cli command layer at all (e.g. a bare Vite app) would
    // invoke it.
    await execa('node', [CLI_BIN], { cwd: buildPath });

    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('accepts --root and --config for a project laid out differently than cwd', async function () {
    const env = { COVERAGE: 'true' };
    const buildPath = await setupTestDir(APP_DIR, env, {});

    fs.copySync(
      `${APP_PATH}/config/-coverage-parallel.js`,
      `${buildPath}/config/coverage.js`,
    );

    await execa('pnpm', ['ember', 'exam', '--split=2', '--parallel=true'], {
      cwd: buildPath,
      env,
    });

    // Invoked from an unrelated cwd, pointed at the project explicitly.
    await execa('node', [
      CLI_BIN,
      '--root',
      buildPath,
      '--config',
      `${buildPath}/config`,
    ]);

    await assertCoverageExists(`${buildPath}/coverage`);
  });
});
