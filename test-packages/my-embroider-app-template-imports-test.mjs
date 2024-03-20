'use strict';

import { execa } from 'execa';
import setupTestDir, { assertCoverageExists, assertFileIsNotEmpty } from './utils.mjs';
import { describe, it } from 'vitest';

const APP_DIR  = 'my-embroider-app-template-imports';

describe('app coverage generation', function () {
    const env = { COVERAGE: 'true' };

    it(`generates coverage with embroider and template imports`, async function () {
      let buildPath = await setupTestDir(APP_DIR, env, {});

      // Embroider tries to reuse .embroider folder if present during builds.
      // We need make sure previous test runs don't affect newer test runs, as the embroider/core
      // version that generated the folder would be different to the one trying to use it, which can lead to unexpected behaviour.
      // await execa('rm',  ['-rf', '.embroider'], { cwd: buildPath, env });
      await execa('rm',  ['-rf', '.embroider'], { cwd: buildPath, env });

      await execa('npx',  ['ember','test', '--test-port=0'], { cwd: buildPath, env });

      await assertCoverageExists(`${buildPath}/coverage`);
    });
});
