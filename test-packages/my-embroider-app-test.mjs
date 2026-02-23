'use strict';

import { execa } from 'execa';
import setupTestDir, { assertCoverageExists } from './utils.mjs';
import { describe, it } from 'vitest';

const APP_DIR  = 'my-embroider-app';

describe('app coverage generation', function () {
  const env = { COVERAGE: 'true' };

  it('generates coverage with embroider', async function () {
    let buildPath = await setupTestDir(APP_DIR, env, {});

    await execa('rm', ['-rf', '.embroider'], { cwd: buildPath, env });

    await execa('npx', ['ember', 'test', '--test-port=0'], { cwd: buildPath, env });

    await assertCoverageExists(`${buildPath}/coverage`);
  });
});
