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

const BASE_PATH = path.join(__dirname, 'my-app');

describe('app coverage generation', function () {
  this.timeout(10000000);

  beforeEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app'], { cwd: __dirname });
  });

  afterEach(async function () {
    await rimraf(`${BASE_PATH}/coverage*`);
    await execa('git', ['clean', '-f', 'my-app'], { cwd: __dirname });
    await execa('git', ['restore', 'my-app'], { cwd: __dirname });
  });

  it('runs coverage when env var is set', async function () {
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;

    let env = { COVERAGE: 'true' };
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    expect(file(`${BASE_PATH}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${BASE_PATH}/coverage/index.html`)).to.not.be.empty;
    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('does not run coverage when env var is NOT set', async function () {
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;

    let env = { COVERAGE: 'false' };
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;
  });

  it('excludes files when the configuration is set', async function () {
    fs.copySync(`${BASE_PATH}/config/-coverage-excludes.js`, `${BASE_PATH}/config/coverage.js`);

    let env = { COVERAGE: 'true' };
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    expect(file(`${BASE_PATH}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${BASE_PATH}/coverage/index.html`)).to.not.be.empty;
    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(75);
  });

  it('merges coverage when tests are run in parallel', async function () {
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;

    let env = { COVERAGE: 'true' };
    await execa('ember', ['exam', '--split=2', '--parallel=true'], { cwd: BASE_PATH, env });
    expect(file(`${BASE_PATH}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${BASE_PATH}/coverage/index.html`)).to.not.be.empty;
    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('uses parallel configuration and merges coverage when merge-coverage command is issued', async function () {
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;
    fs.copySync(`${BASE_PATH}/config/-coverage-parallel.js`, `${BASE_PATH}/config/coverage.js`);

    let env = { COVERAGE: 'true' };
    await execa('ember', ['exam', '--split=2', '--parallel=true'], { cwd: BASE_PATH, env });
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;

    await execa('ember', ['coverage-merge'], { cwd: BASE_PATH });
    expect(file(`${BASE_PATH}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${BASE_PATH}/coverage/index.html`)).to.not.be.empty;
    let summary = fs.readJSONSync(`${BASE_PATH}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('uses nested coverageFolder and parallel configuration and run merge-coverage', async function () {
    let coverageFolder = `${BASE_PATH}/coverage/abc/easy-as/123`;

    expect(dir(coverageFolder)).to.not.exist;
    fs.copySync(
      `${BASE_PATH}/config/-coverage-nested-folder.js`,
      `${BASE_PATH}/config/coverage.js`
    );

    let env = { COVERAGE: 'true' };
    await execa('ember', ['exam', '--split=2', '--parallel=true'], { cwd: BASE_PATH, env });
    expect(dir(coverageFolder)).to.not.exist;

    await execa('ember', ['coverage-merge'], { cwd: BASE_PATH });
    expect(file(`${coverageFolder}/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${coverageFolder}/index.html`)).to.not.be.empty;
    let summary = fs.readJSONSync(`${coverageFolder}/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('runs coverage when a module has an import error', async function () {
    expect(dir(`${BASE_PATH}/coverage`)).to.not.exist;
    fs.copySync(`${BASE_PATH}/-error-module.js`, `${BASE_PATH}/app/error-module.js`);

    let env = { COVERAGE: 'true' };
    await execa('ember', ['test'], { cwd: BASE_PATH, env });
    expect(dir(`${BASE_PATH}/coverage`)).to.exist;
  });
});
