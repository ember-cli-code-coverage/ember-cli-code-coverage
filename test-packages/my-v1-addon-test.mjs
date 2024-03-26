'use strict';

import { execa } from 'execa';
import { default as setupTestDir } from './utils.mjs';
import { describe, it, expect } from 'vitest';
import { readJSON } from 'fs-extra';

const BASE_PATH = 'my-v1-addon';

describe('v1 addon coverage generation', function () {
  const env = { COVERAGE: 'true' };

  it('runs coverage for v1 addons', async function () {
    const buildPath = await setupTestDir(BASE_PATH, env, {});

    await execa('npm', ['run', 'test', '--test-port=0'], { cwd: buildPath, env });

    const coverageSummary = await readJSON(`${buildPath}/coverage/coverage-summary.json`);

    expect(coverageSummary).toMatchInlineSnapshot(`
      {
        "addon-test-support/uncovered-test-support.js": {
          "branches": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 2,
          },
          "functions": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 2,
          },
          "lines": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 4,
          },
          "statements": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 4,
          },
        },
        "addon/utils/my-covered-util.js": {
          "branches": {
            "covered": 0,
            "pct": 100,
            "skipped": 0,
            "total": 0,
          },
          "functions": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 1,
          },
          "lines": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 1,
          },
          "statements": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 1,
          },
        },
        "addon/utils/my-uncovered-util.js": {
          "branches": {
            "covered": 0,
            "pct": 100,
            "skipped": 0,
            "total": 0,
          },
          "functions": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 1,
          },
          "lines": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 1,
          },
          "statements": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 1,
          },
        },
        "total": {
          "branches": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 2,
          },
          "branchesTrue": {
            "covered": 0,
            "pct": 100,
            "skipped": 0,
            "total": 0,
          },
          "functions": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 4,
          },
          "lines": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 6,
          },
          "statements": {
            "covered": 0,
            "pct": 0,
            "skipped": 0,
            "total": 6,
          },
        },
      }  
    `);
  });
});
