'use strict';

import { execa } from 'execa';
import { default as setupTestDir } from './utils.mjs';
import { it, describe, expect } from 'vitest';
import { readJSON } from 'fs-extra';

const APP_NAME = 'my-app-with-in-repo-addon';

describe('in-repo addon coverage generation', function () {
  const env = { COVERAGE: 'true' };

  it('runs coverage on in-repo addon', async function () {
    const buildPath = await setupTestDir(APP_NAME, env, {});
    await execa('pnpm', ['ember' , 'test','--test-port=0'], { cwd: buildPath, env });
    let summary = await readJSON(`${buildPath}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });
  
  it('runs coverage when the path option is used', async function () {
    const buildPath = await setupTestDir(APP_NAME, env, {});
    await execa('pnpm', ['ember', 'build', '--output-path=test-dist'], { cwd: buildPath, env });
    await execa('pnpm', ['ember', 'test', '--path=test-dist','--test-port=0'], { cwd: buildPath, env });
    let summary = await readJSON(`${buildPath}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });
});
