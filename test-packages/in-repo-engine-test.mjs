import { execa } from 'execa';
import { it, describe } from 'vitest';
import setupTestDir, { assertCoverageExists } from './utils.mjs';

const APP_DIR = 'my-app-with-in-repo-engine';

describe('in-repo engine coverage generation', function () {
  it('runs coverage on in-repo engine', async function () {
    let env = { COVERAGE: 'true' };
    let buildPath = await setupTestDir(APP_DIR, env, {});
    await execa('pnpm', ['ember' , 'test','--test-port=0'], { cwd: buildPath, env });
    await assertCoverageExists(`${buildPath}/coverage`);
  });
});
