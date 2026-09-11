'use strict';

import fs from 'fs-extra';
import { execa } from 'execa';
import { readJSON } from 'fs-extra';
import { describe, it, expect } from 'vitest';
import setupTestDir, { assertFileIsNotEmpty } from './utils.mjs';

const APP_DIR = 'my-app-template-coverage';
const TEMPLATE = 'app/components/coverage-demo.hbs';

const env = { COVERAGE: 'true' };

async function runCoverage(buildPath) {
  await execa('npx', ['ember', 'test', '--test-port=0'], {
    cwd: buildPath,
    env,
  });
  return readJSON(`${buildPath}/coverage/coverage-summary.json`);
}

describe('template coverage', function () {
  it('reports branch coverage for hbs templates', async function () {
    const buildPath = await setupTestDir(APP_DIR, env, {});
    const summary = await runCoverage(buildPath);

    await assertFileIsNotEmpty(`${buildPath}/coverage/index.html`);

    const template = summary[TEMPLATE];
    expect(template, `${TEMPLATE} should appear in the report`).toBeDefined();

    // The component holds five branching constructs — an if/else, an if
    // with no else, an inline if, an unless, and an each with an else —
    // each contributing two paths.
    expect(template.branches.total).toBe(10);

    // The test renders only the truthy side of every construct.
    expect(template.branches.covered).toBe(5);
    expect(template.branches.pct).toBe(50);
  });

  it('leaves templates out of the report when template coverage is off', async function () {
    const buildPath = await setupTestDir(APP_DIR, env, {});
    const configPath = `${buildPath}/config/coverage.js`;

    fs.writeFileSync(
      configPath,
      fs
        .readFileSync(configPath, 'utf8')
        .replace('templateCoverage: true', 'templateCoverage: false'),
    );

    const summary = await runCoverage(buildPath);

    expect(summary[TEMPLATE]).toBeUndefined();
    // JavaScript coverage is unaffected.
    expect(summary['app/router.js']).toBeDefined();
  });
});
