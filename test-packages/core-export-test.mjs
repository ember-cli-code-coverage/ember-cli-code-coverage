'use strict';

import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import setupTestDir from './utils.mjs';

const APP_DIR = 'my-app';

/**
 * `ember-cli-code-coverage/core` exists so a consumer can pull in the
 * config/path-mapping/report utilities on their own — for a custom
 * middleware, a script, whatever — without also pulling in babel, vite,
 * or testem-specific code. Unlike the other test-packages/*-test.mjs
 * files, which import straight from `dist/` to reach code under test,
 * this one has to go through the package's own name: that's the only
 * way to prove the `exports` map entry itself is wired correctly, since
 * a real consumer never imports from `dist/` directly.
 */
describe('ember-cli-code-coverage/core', function () {
  it('resolves through the package export map and exposes the config/report utilities', async function () {
    const buildPath = await setupTestDir(APP_DIR, { COVERAGE: 'true' }, {});

    const result = await execa(
      'node',
      [
        '--input-type=module',
        '-e',
        `
        import { getConfig, isCoverageEnabled, DEFAULT_CONFIG, createReport } from 'ember-cli-code-coverage/core';

        const config = getConfig();
        console.log(JSON.stringify({
          hasDefaults: config.coverageFolder === DEFAULT_CONFIG.coverageFolder,
          // process.env.COVERAGE is 'true' in this child process (see the
          // execa call below), so the default env var name should read true.
          enabledWhenSet: isCoverageEnabled(),
          disabledForOtherVar: isCoverageEnabled({ coverageEnvVar: 'SOME_OTHER_VAR' }),
          reportExecutable: typeof createReport('lcov').execute === 'function',
        }));
        `,
      ],
      { cwd: buildPath, env: { COVERAGE: 'true' } },
    );

    const output = JSON.parse(result.stdout);
    expect(output.hasDefaults).toBe(true);
    expect(output.enabledWhenSet).toBe(true);
    expect(output.disabledForOtherVar).toBe(false);
    expect(output.reportExecutable).toBe(true);
  });
});
