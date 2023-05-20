'use strict';

const fs = require('fs-extra');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const { dir, file } = require('chai-files');
const path = require('path');
const execa = require('execa');

const APP_DIR  = 'my-embroider-app';
const BASE_PATH = path.join(__dirname,APP_DIR);

describe('app coverage generation', function () {
  jest.setTimeout(10000000);

  beforeEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f',APP_DIR], { cwd: __dirname });
    await execa('git', ['restore',APP_DIR], { cwd: __dirname });
  });

  afterEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f',APP_DIR], { cwd: __dirname });
    await execa('git', ['restore',APP_DIR], { cwd: __dirname });
    await execa('git', ['clean', '-f', 'yarn.lock']);
    await execa('git', ['restore', 'yarn.lock']);
  });

  it('runs coverage when env var is set', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();

    let env = { COVERAGE: 'true' };
    await execa('yarn',['install'], { env });
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });

  it('generates coverage with @ember/compat >= 2.1.0', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();

    let env = { COVERAGE: 'true' };
    fs.copySync(`${BASE_PATH}/-package-with-compat-2.json`, `${BASE_PATH}/package.json`);
    await execa('yarn',['install'], { env });
    await execa('ember', ['test'], { cwd: BASE_PATH, env });

    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });
});
