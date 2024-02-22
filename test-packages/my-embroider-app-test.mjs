'use strict';

import { execa } from 'execa';
import setupTestDir, { assertCoverageExists, assertFileIsNotEmpty } from './utils.mjs';
import { describe, it } from 'vitest';

const APP_DIR  = 'my-embroider-app';

describe('app coverage generation', function () {
  const env = { COVERAGE: 'true' };

  for (const embroiderVersion of [
      '^0.47.0',
      '^1.0.0',
      '^2.1.0', 
      '^3.1.0'
    ]) {
    it(`generates coverage with @embroider ${embroiderVersion}`, async function (context) {
      let buildPath = await setupTestDir(APP_DIR, env, {
        "@embroider/compat": embroiderVersion,
        "@embroider/core": embroiderVersion,
        "@embroider/webpack": embroiderVersion
      });
  
      // Embroider tries to reuse .embroider folder if present during builds.
      // We need make sure previous test runs don't affect newer test runs, as the embroider/core
      // version that generated the folder would be different to the one trying to use it, which can lead to unexpected behaviour.
      await execa('rm',  ['-rf', '.embroider'], { cwd: buildPath, env });

      await execa('npx',  ['ember','test', '--test-port=0'], { cwd: buildPath, env });
  
      await assertCoverageExists(`${buildPath}/coverage`);
    });
  }
});
