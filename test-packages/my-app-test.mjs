'use strict';

import fs from 'fs-extra';
import { execa } from 'execa';
import setupTestDir, { assertCoverageExists, assertDirDoesNotExists } from './utils.mjs';
import { describe, it } from 'vitest';

const APP_DIR = 'my-app';
const APP_PATH = `test-packages/${APP_DIR}`;

describe('app coverage generation', function () {
  const env = { COVERAGE: 'true' };

  it('runs coverage when env var is set', async function () {
    let buildPath = await setupTestDir(APP_DIR, env, {});

    await execa('npx', ['ember', 'test', '--test-port=0'], { cwd: buildPath, env });

    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('does not run coverage when env var is NOT set', async function () {
    let env = { COVERAGE: 'false' };
    let buildPath = await setupTestDir(APP_DIR, env, {});

    await execa('npx', ['ember', 'test', '--test-port=0'], { cwd: buildPath, env });

    await assertDirDoesNotExists(`${buildPath}/coverage`);
  });

  it('excludes files when the configuration is set', async function () {
    let env = { COVERAGE: 'true' };
    let buildPath = await setupTestDir(APP_DIR, env, {});
    fs.copySync(`${APP_PATH}/config/-coverage-excludes.js`, `${buildPath}/config/coverage.js`);

    await execa('npx', ['ember', 'test', '--test-port=0'], { cwd: buildPath, env });

    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('runs coverage when the path option is used', async function () {
    let env = { COVERAGE: 'true' };
    let buildPath = await setupTestDir(APP_DIR, env, {});

    await execa('pnpm', ['ember', 'build', '--output-path=test-dist'], { cwd: buildPath, env });
    await execa('pnpm', ['ember', 'test', '--path=test-dist', '--test-port=0'], { cwd: buildPath, env });

    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('merges coverage when tests are run in parallel', async function () {
    let env = { COVERAGE: 'true' };
    let buildPath = await setupTestDir(APP_DIR, env, {});
    await execa('pnpm', ['ember', 'exam', '--split=2', '--parallel=true'], { cwd: buildPath, env });
    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('uses parallel configuration and merges coverage when merge-coverage command is issued', async function () {
    let env = { COVERAGE: 'true' };
    let buildPath = await setupTestDir(APP_DIR, env, {});
    fs.copySync(`${APP_PATH}/config/-coverage-parallel.js`, `${buildPath}/config/coverage.js`);

    await execa('pnpm', ['ember', 'exam', '--split=2', '--parallel=true'], { cwd: buildPath, env });
    await assertDirDoesNotExists(`${buildPath}/coverage`);

    await execa('pnpm', ['ember', 'coverage-merge'], { cwd: buildPath });

    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('uses nested coverageFolder and parallel configuration and run merge-coverage', async function () {
    let env = { COVERAGE: 'true' };
    let buildPath = await setupTestDir(APP_DIR, env, {});
    let coverageFolder = `${buildPath}/coverage/abc/easy-as/123`;

    await assertDirDoesNotExists(coverageFolder);
    fs.copySync(`${APP_PATH}/config/-coverage-nested-folder.js`, `${buildPath}/config/coverage.js`);

    await execa('pnpm', ['ember', 'exam', '--split=2', '--parallel=true'], { cwd: buildPath, env });
    await assertDirDoesNotExists(coverageFolder);

    await execa('pnpm', ['ember', 'coverage-merge'], { cwd: buildPath });
    await assertCoverageExists(coverageFolder);
  });

  it('runs coverage when a module has an import error', async function () {
    let env = { COVERAGE: 'true' };
    let buildPath = await setupTestDir(APP_DIR, env, {});
    fs.copySync(`${APP_PATH}/-error-module.js`, `${buildPath}/app/error-module.js`);

    await execa('pnpm', ['ember', 'test',' --test-port=0'], { cwd: buildPath, env });

    await assertCoverageExists(`${buildPath}/coverage`);
  });
});
