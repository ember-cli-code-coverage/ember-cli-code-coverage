'use strict';

const fs = require('fs-extra');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const { dir, file } = require('chai-files');
const path = require('path');
const execa = require('execa');

const BASE_PATH = path.join(__dirname, 'my-app-with-in-repo-engine');

describe('in-repo engine coverage generation', function () {
  jest.setTimeout(10000000);

  beforeEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-with-in-repo-engine'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-with-in-repo-engine'], { cwd: __dirname });
  });

  afterEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-with-in-repo-engine'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-with-in-repo-engine'], { cwd: __dirname });
  });

  it('runs coverage on in-repo engine', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();

    let env = { COVERAGE: 'true' };
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    const summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
    expect(summary['app/utils/my-covered-util-app.js'].lines.total).to.equal(1);

    // Check that lib/my-in-repo-engine/utils/my-covered-utill is 1 line and that 1 line is covered
    expect(summary['lib/my-in-repo-engine/addon/utils/my-covered-util.js'].lines.total).to.equal(1);
    expect(summary['lib/my-in-repo-engine/addon/utils/my-covered-util.js'].lines.covered).to.equal(
      1
    );

    // Check that lib/my-in-repo-engine/utils/my-uncovered-utill is 1 line and that 0 lines are covered
    expect(summary['lib/my-in-repo-engine/addon/utils/my-uncovered-util.js'].lines.total).to.equal(
      1
    );
    expect(
      summary['lib/my-in-repo-engine/addon/utils/my-uncovered-util.js'].lines.covered
    ).to.equal(0);
  });
});
