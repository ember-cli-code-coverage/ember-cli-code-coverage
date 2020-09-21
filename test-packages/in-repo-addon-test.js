'use strict';

const fs = require('fs-extra');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const chai = require('chai');
const expect = chai.expect;
const chaiFiles = require('chai-files');
const dir = chaiFiles.dir;
const file = chaiFiles.file;
const path = require('path');
const execa = require('execa');

chai.use(chaiFiles);

const BASE_PATH = path.join(__dirname, 'my-app-with-in-repo-addon');

describe('in-repo addon coverage generation', function () {
  this.timeout(10000000);

  beforeEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-with-in-repo-addon'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-with-in-repo-addon'], { cwd: __dirname });
  });

  afterEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-with-in-repo-addon'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-with-in-repo-addon'], { cwd: __dirname });
  });

  it('runs coverage on in-repo addon', async function () {
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;

    let env = { COVERAGE: 'true' };
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    expect(file(`${BASE_PATH}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${BASE_PATH}/coverage/index.html`)).to.not.be.empty;

    const summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(46.67);
    expect(summary['app/utils/my-covered-util-app.js'].lines.total).to.equal(1);

    // Check that lib/my-in-repo-addon/utils/my-covered-utill is 1 line and that 1 line is covered
    expect(summary['lib/my-in-repo-addon/addon/utils/my-covered-util.js'].lines.total).to.equal(1);
    expect(summary['lib/my-in-repo-addon/addon/utils/my-covered-util.js'].lines.covered).to.equal(
      1
    );

    // Check that lib/my-in-repo-addon/utils/my-uncovered-utill is 1 line and that 0 lines are covered
    expect(summary['lib/my-in-repo-addon/addon/utils/my-uncovered-util.js'].lines.total).to.equal(
      1
    );
    expect(summary['lib/my-in-repo-addon/addon/utils/my-uncovered-util.js'].lines.covered).to.equal(
      0
    );

    // Check that lib/my-in-repo-addon/addon-test-support/uncovered-test-support is 4 lines and that 0 lines are covered
    expect(
      summary['lib/my-in-repo-addon/addon-test-support/uncovered-test-support.js'].lines.total
    ).to.equal(4);
    expect(
      summary['lib/my-in-repo-addon/addon-test-support/uncovered-test-support.js'].lines.covered
    ).to.equal(0);
  });
});
