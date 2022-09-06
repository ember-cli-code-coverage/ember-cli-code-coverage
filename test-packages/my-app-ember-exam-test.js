'use strict';

const fs = require('fs-extra');
const util = require('util');
const glob = require('glob');
const rimraf = util.promisify(require('rimraf'));
const { dir, file } = require('chai-files');
const path = require('path');
const execa = require('execa');

const BASE_PATH = path.join(__dirname, 'my-app-ember-exam');

describe('ember-exam app coverage generation', function () {
  jest.setTimeout(10000000);

  beforeEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-ember-exam'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-ember-exam'], { cwd: __dirname });
  });

  afterEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app-ember-exam'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app-ember-exam'], { cwd: __dirname });
  });

  it('runs coverage when the path option is used', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();

    let env = { COVERAGE: 'true' };
    await execa('ember', ['build', '--output-path=test-dist'], { cwd: BASE_PATH, env });
    await execa('ember', ['exam', '--path=test-dist'], { cwd: BASE_PATH, env });
    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });

  it('merges coverage when tests are run in parallel', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();

    let env = { COVERAGE: 'true' };
    await execa('ember', ['exam', '--split=2', '--parallel=true'], { cwd: BASE_PATH, env });
    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });

  it('uses parallel configuration and merges coverage when merge-coverage command is issued', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();
    fs.copySync(`${BASE_PATH}/config/-coverage-parallel.js`, `${BASE_PATH}/config/coverage.js`);

    let env = { COVERAGE: 'true' };
    await execa('ember', ['exam', '--split=2', '--parallel=true'], { cwd: BASE_PATH, env });
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();

    await execa('ember', ['coverage-merge'], { cwd: BASE_PATH });
    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });

  it('uses path and uses parallel configuration and merges coverage when merge-coverage command is issued', async function () {
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();
    fs.copySync(`${BASE_PATH}/config/-coverage-parallel.js`, `${BASE_PATH}/config/coverage.js`);
    const split = 4

    let env = { COVERAGE: 'true' };
    await execa('ember', ['build', '--output-path=test-dist'], { cwd: BASE_PATH, env });
    await execa('ember', ['exam', '--path=test-dist', `--split=${split}`, `--parallel=1`], { cwd: BASE_PATH, env });
    dir(`${BASE_PATH}/coverage`).assertDoesNotExist();


    expect(coverageFolders.length).toEqual(split);

    await execa('ember', ['coverage-merge'], { cwd: BASE_PATH });
    file(`${BASE_PATH}/coverage/lcov-report/index.html`).assertIsNotEmpty();
    file(`${BASE_PATH}/coverage/index.html`).assertIsNotEmpty();

    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary).toMatchSnapshot();
  });

  it('uses nested coverageFolder and parallel configuration and run merge-coverage', async function () {
    let coverageFolder = `${BASE_PATH} / coverage / abc / easy - as / 123`;

    dir(coverageFolder).assertDoesNotExist();
    fs.copySync(
      `${BASE_PATH} / config / -coverage - nested - folder.js`,
      `${BASE_PATH} / config / coverage.js`
    );

    let env = { COVERAGE: 'true' };
    await execa('ember', ['exam', '--split=2', '--parallel=true'], { cwd: BASE_PATH, env });
    dir(coverageFolder).assertDoesNotExist();

    await execa('ember', ['coverage-merge'], { cwd: BASE_PATH });
    file(`${coverageFolder} / lcov - report / index.html`).assertIsNotEmpty();
    file(`${coverageFolder} / index.html`).assertIsNotEmpty();

    let summary = fs.readJSONSync(`${coverageFolder} / coverage - summary.json`);
    expect(summary).toMatchSnapshot();
  });
});
