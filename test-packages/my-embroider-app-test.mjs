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
  
      await execa('npx',  ['ember','test', '--test-port=0'], { cwd: buildPath, env });
  
      await assertCoverageExists(`${buildPath}/coverage`);
    });
  }
});
