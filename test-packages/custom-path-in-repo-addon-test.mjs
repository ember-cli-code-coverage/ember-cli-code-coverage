'use strict';

import { execa } from 'execa';
import { assertCoverageExists, default as setupTestDir } from './utils.mjs';
import { it, describe } from 'vitest';

const BASE_PATH = 'my-app-with-custom-path-in-repo-addon';

describe('alternate in-repo addon coverage generation', function () {
  it('runs coverage on in-repo addons from a non-standard directory structure', async function () {
    let env = { COVERAGE: 'true' };
    const buildPath = await setupTestDir(BASE_PATH, env, {});
    await execa('pnpm', ['ember' , 'test', '--test-port=0'], { cwd: buildPath, env });
    await assertCoverageExists(`${buildPath}/coverage`);
  });
});
