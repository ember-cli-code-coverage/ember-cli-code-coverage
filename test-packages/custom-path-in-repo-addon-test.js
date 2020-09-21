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
    expect(summary).toMatchSnapshot();
  });
});
