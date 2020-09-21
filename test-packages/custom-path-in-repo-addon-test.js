'use strict';

const fs = require('fs-extra');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const { dir, file } = require('chai-files');
const path = require('path');
const execa = require('execa');

const BASE_PATH = path.join(__dirname, 'my-app-with-custom-path-in-repo-addon');

describe('alternate in-repo addon coverage generation', function () {
  jest.setTimeout(10000000);

  beforeEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-with-custom-path-in-repo-addon'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-with-custom-path-in-repo-addon'], { cwd: __dirname });
  });

  afterEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-with-custom-path-in-repo-addon'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-with-custom-path-in-repo-addon'], { cwd: __dirname });
  });

  it('runs coverage on in-repo addons from a non-standard directory structure', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();

    let env = { COVERAGE: 'true' };
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    const summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(46.67);
    expect(summary['app/utils/my-covered-util-app.js'].lines.total).to.equal(1);

    // Check that local-lib/addons/my-in-repo-addon/utils/my-covered-utill
    // is 1 line and that 1 line is covered
    expect(
      summary['local-lib/addons/my-in-repo-addon/addon/utils/my-covered-util.js'].lines.total
    ).to.equal(1);
    expect(
      summary['local-lib/addons/my-in-repo-addon/addon/utils/my-covered-util.js'].lines.covered
    ).to.equal(1);

    // Check that local-lib/addons/my-in-repo-addon/utils/my-uncovered-utill
    // is 1 line and that 0 lines are covered
    expect(
      summary['local-lib/addons/my-in-repo-addon/addon/utils/my-uncovered-util.js'].lines.total
    ).to.equal(1);
    expect(
      summary['local-lib/addons/my-in-repo-addon/addon/utils/my-uncovered-util.js'].lines.covered
    ).to.equal(0);

    // Check that local-lib/addons/my-in-repo-addon/addon-test-support/uncovered-test-support
    // is 4 lines and that 0 lines are covered
    expect(
      summary['local-lib/addons/my-in-repo-addon/addon-test-support/uncovered-test-support.js']
        .lines.total
    ).to.equal(4);

    expect(
      summary['local-lib/addons/my-in-repo-addon/addon-test-support/uncovered-test-support.js']
        .lines.covered
    ).to.equal(0);
  });
});
