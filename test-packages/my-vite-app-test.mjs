'use strict';

import { execa } from 'execa';
import { readdir, readFile } from 'node:fs/promises';
import { readJSON } from 'fs-extra';
import { describe, it, expect } from 'vitest';
import setupTestDir, {
  assertCoverageExists,
  assertDirDoesNotExist,
} from './utils.mjs';

const APP_DIR = 'my-vite-app';

/**
 * Ember Vite apps test against a built bundle, so coverage has to survive
 * `vite build` and then be collected by testem rather than by the Vite
 * dev server.
 */
async function buildAndTest(buildPath, env) {
  await execa('rm', ['-rf', 'dist'], { cwd: buildPath, env });
  await execa('pnpm', ['vite', 'build', '--mode', 'development'], {
    cwd: buildPath,
    env,
  });
  await execa('npx', ['ember', 'test', '--path=dist', '--test-port=0'], {
    cwd: buildPath,
    env,
  });
}

/**
 * True when the application chunk carries Istanbul instrumentation.
 *
 * Only `app-*` chunks are scanned. The tests chunk always mentions
 * `__coverage__` because this addon's own `sendCoverage` helper reads it,
 * so scanning everything would report instrumentation even when coverage
 * is off. Istanbul's own `cov_*` accessor is minified away by the
 * bundler, which is why the marker is the global's name rather than it.
 */
async function distIsInstrumented(buildPath) {
  const assetsDir = `${buildPath}/dist/assets`;
  const files = await readdir(assetsDir);

  for (const file of files) {
    if (!file.startsWith('app-') || !file.endsWith('.js')) continue;
    if (
      (await readFile(`${assetsDir}/${file}`, 'utf-8')).includes('__coverage__')
    ) {
      return true;
    }
  }

  return false;
}

describe('vite app coverage generation', function () {
  it('runs coverage when env var is set', async function () {
    const env = { COVERAGE: 'true' };
    const buildPath = await setupTestDir(APP_DIR, env, {});

    await buildAndTest(buildPath, env);

    expect(await distIsInstrumented(buildPath)).toBe(true);
    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('does not run coverage when env var is NOT set', async function () {
    const env = { COVERAGE: 'false' };
    const buildPath = await setupTestDir(APP_DIR, env, {});

    await buildAndTest(buildPath, env);

    expect(await distIsInstrumented(buildPath)).toBe(false);
    await assertDirDoesNotExist(`${buildPath}/coverage`);
  });

  it('reports modules no test imported, from the build-time baseline', async function () {
    const env = { COVERAGE: 'true' };
    const buildPath = await setupTestDir(APP_DIR, env, {});

    await buildAndTest(buildPath, env);

    const summary = await readJSON(
      `${buildPath}/coverage/coverage-summary.json`,
    );
    const uncovered = Object.keys(summary).find((key) =>
      key.includes('my-uncovered-util'),
    );

    // Nothing imports this module, so Vite never evaluates it and it would
    // be absent from the report without the baseline.
    expect(uncovered, 'uncovered util should still be reported').toBeDefined();
    expect(summary[uncovered].statements.covered).toBe(0);
    expect(summary[uncovered].statements.total).toBeGreaterThan(0);
  });

  it('reports strict-mode template branch coverage for .gjs components', async function () {
    const env = { COVERAGE: 'true' };
    const buildPath = await setupTestDir(APP_DIR, env, {});

    await buildAndTest(buildPath, env);

    const summary = await readJSON(
      `${buildPath}/coverage/coverage-summary.json`,
    );
    const demo = summary['app/components/coverage-demo.gjs'];

    // coverage-demo.gjs has five branching constructs (if/else, if with no
    // else, inline if, unless, each/else), each contributing two paths.
    // The test renders only the truthy side of every one, so exactly half
    // should be covered — matching the loose-mode .hbs equivalent of this
    // same component design in template-coverage-test.mjs.
    expect(
      demo,
      'app/components/coverage-demo.gjs should appear in the report',
    ).toBeDefined();
    expect(demo.branches.total).toBe(10);
    expect(demo.branches.covered).toBe(5);
    expect(demo.branches.pct).toBe(50);

    // This file also has real JS output (the compiled template() call),
    // which babel-plugin-istanbul instruments independently — proving the
    // two coverage sources merged into one report entry rather than one
    // discarding the other.
    expect(demo.functions.total).toBeGreaterThan(0);
  });
});
