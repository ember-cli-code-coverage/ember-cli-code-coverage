'use strict';

const fs = require('fs-extra');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const { dir, file } = require('chai-files');
const path = require('path');
const execa = require('execa');

const BASE_PATH = path.join(__dirname, 'my-addon');

describe('addon coverage generation', function () {
  jest.setTimeout(10000000);

  beforeEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-addon'], { cwd: __dirname });
    await execa('git', ['restore', 'my-addon'], { cwd: __dirname });
  });

  afterEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-addon'], { cwd: __dirname });
    await execa('git', ['restore', 'my-addon'], { cwd: __dirname });
  });

  it('runs coverage on templates when option is set', async function() {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();
    fs.copySync(`${BASE_PATH}/config/-coverage-template.js`, `${BASE_PATH}/config/coverage.js`);

    let env = { COVERAGE: 'true' };
    await execa('yarn', ['test'], { cwd: BASE_PATH, env });

    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });
});
