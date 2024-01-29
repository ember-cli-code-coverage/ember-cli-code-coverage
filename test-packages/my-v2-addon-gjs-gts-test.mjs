'use strict';

import { execa } from 'execa';
import { assertCoverageExists, setupV2AddonTestDirs } from './utils.mjs';
import { describe, it, expect } from 'vitest';
import { readJSON } from 'fs-extra';

const APP_DIR = 'my-v2-addon-gjs-gts';

describe('v2 addon coverage generation', function () {
  const env = { COVERAGE: 'true' };

  it('runs coverage for v2 addon with gjs and gts files', async function () {
    const { testAppDir, addonDir } = await setupV2AddonTestDirs(APP_DIR, env);

    const leafTmpFolderName = addonDir.split("/").pop();
  
    await execa('npm', ['run', 'test', '--test-port=0'], { cwd: testAppDir, env });

    const coverageSummary = await readJSON(`${testAppDir}/coverage/coverage-summary.json`);
    const coverageFinal = await readJSON(`${testAppDir}/coverage/coverage-final.json`);

    expect(coverageSummary).toMatchInlineSnapshot(`
      {
        "../${leafTmpFolderName}/src/components/bar.gjs": {
          "branches": {
            "covered": 0,
            "pct": 100,
            "skipped": 0,
            "total": 0,
          },
          "functions": {
            "covered": 1,
            "pct": 100,
            "skipped": 0,
            "total": 1,
          },
          "lines": {
            "covered": 3,
            "pct": 100,
            "skipped": 0,
            "total": 3,
          },
          "statements": {
            "covered": 3,
            "pct": 100,
            "skipped": 0,
            "total": 3,
          },
        },
        "../${leafTmpFolderName}/src/components/foo.gts": {
          "branches": {
            "covered": 0,
            "pct": 100,
            "skipped": 0,
            "total": 0,
          },
          "functions": {
            "covered": 1,
            "pct": 100,
            "skipped": 0,
            "total": 1,
          },
          "lines": {
            "covered": 3,
            "pct": 100,
            "skipped": 0,
            "total": 3,
          },
          "statements": {
            "covered": 3,
            "pct": 100,
            "skipped": 0,
            "total": 3,
          },
        },
        "total": {
          "branches": {
            "covered": 0,
            "pct": 100,
            "skipped": 0,
            "total": 0,
          },
          "branchesTrue": {
            "covered": 0,
            "pct": "Unknown",
            "skipped": 0,
            "total": 0,
          },
          "functions": {
            "covered": 2,
            "pct": 100,
            "skipped": 0,
            "total": 2,
          },
          "lines": {
            "covered": 6,
            "pct": 100,
            "skipped": 0,
            "total": 6,
          },
          "statements": {
            "covered": 6,
            "pct": 100,
            "skipped": 0,
            "total": 6,
          },
        },
      }
    `);
    expect(coverageFinal).toMatchInlineSnapshot(`
      {
        "../${leafTmpFolderName}/src/components/bar.gjs": {
          "b": {},
          "branchMap": {},
          "f": {
            "0": 1,
          },
          "fnMap": {
            "0": {
              "decl": {
                "end": {
                  "column": null,
                  "line": 13,
                },
                "start": {
                  "column": 9,
                  "line": 13,
                },
              },
              "loc": {
                "end": {
                  "column": null,
                  "line": 16,
                },
                "start": {
                  "column": 9,
                  "line": 13,
                },
              },
              "name": "bar",
            },
          },
          "path": "../${leafTmpFolderName}/src/components/bar.gjs",
          "s": {
            "0": 1,
            "1": 1,
            "2": 1,
          },
          "statementMap": {
            "0": {
              "end": {
                "column": null,
                "line": 3,
              },
              "start": {
                "column": 14,
                "line": 3,
              },
            },
            "1": {
              "end": {
                "column": null,
                "line": 14,
              },
              "start": {
                "column": 2,
                "line": 14,
              },
            },
            "2": {
              "end": {
                "column": null,
                "line": 15,
              },
              "start": {
                "column": 2,
                "line": 15,
              },
            },
          },
        },
        "../${leafTmpFolderName}/src/components/foo.gts": {
          "b": {},
          "branchMap": {},
          "f": {
            "0": 1,
          },
          "fnMap": {
            "0": {
              "decl": {
                "end": {
                  "column": 3,
                  "line": 9,
                },
                "start": {
                  "column": 2,
                  "line": 9,
                },
              },
              "loc": {
                "end": {
                  "column": null,
                  "line": 13,
                },
                "start": {
                  "column": 14,
                  "line": 10,
                },
              },
              "name": "(anonymous_0)",
            },
          },
          "path": "../${leafTmpFolderName}/src/components/foo.gts",
          "s": {
            "0": 1,
            "1": 1,
            "2": 1,
          },
          "statementMap": {
            "0": {
              "end": {
                "column": 19,
                "line": 7,
              },
              "start": {
                "column": 17,
                "line": 7,
              },
            },
            "1": {
              "end": {
                "column": null,
                "line": 11,
              },
              "start": {
                "column": 4,
                "line": 11,
              },
            },
            "2": {
              "end": {
                "column": null,
                "line": 12,
              },
              "start": {
                "column": 4,
                "line": 12,
              },
            },
          },
        },
      }
    `);
  });
});
