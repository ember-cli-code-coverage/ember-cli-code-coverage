'use strict';

var fs = require('fs-extra');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
var chai = require('chai');
var expect = chai.expect;
var chaiFiles = require('chai-files');
var dir = chaiFiles.dir;
var file = chaiFiles.file;
var path = require('path');

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

chai.use(chaiFiles);

let app;

describe('app coverage generation', function () {
  this.timeout(10000000);

  beforeEach(async function () {
    app = new AddonTestApp();

    await app.create('my-app', {
      emberVersion: '3.4.0',
    });

    app.editPackageJSON(pkg => {
      delete pkg.devDependencies['ember-cli-eslint'];

      pkg.devDependencies['ember-exam'] = '1.0.0';
      pkg.devDependencies['ember-cli-babel'] = '^7.1.0';
      // Temporarily remove the addon before install to work around https://github.com/tomdale/ember-cli-addon-tests/issues/176
      delete pkg.devDependencies['ember-cli-code-coverage'];
    });

    await app.run('npm', 'install');

    app.editPackageJSON(pkg => {
      pkg.devDependencies['ember-cli-code-coverage'] = '*';
    });

    let addonPath = path.join(app.path, 'node_modules', 'ember-cli-code-coverage');
    fs.removeSync(addonPath);
    fs.ensureSymlinkSync(process.cwd(), addonPath);

    await rimraf(`${app.path}/coverage*`);
  });

  afterEach(async function () {
    await rimraf(`${app.path}/config/coverage.js`);
  });

  it('runs coverage when env var is set', async function () {
    expect(dir(`${app.path}/coverage`)).to.not.exist;

    process.env.COVERAGE = 'true';

    await app.run('ember', 'test');
    expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
    var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('does not run coverage when env var is NOT set', async function () {
    expect(dir(`${app.path}/coverage`)).to.not.exist;

    process.env.COVERAGE = 'false';

    await app.run('ember', 'test');
    expect(dir(`${app.path}/coverage`)).to.not.exist;
  });

  it('excludes files when the configuration is set', async function () {
    fs.copySync('tests/dummy/config/coverage-excludes.js', `${app.path}/config/coverage.js`);

    process.env.COVERAGE = 'true';

    await app.run('ember', 'test');
    expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
    var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(75);
  });

  it('merges coverage when tests are run in parallel', async function () {
    expect(dir(`${app.path}/coverage`)).to.not.exist;

    process.env.COVERAGE = 'true';

    await app.run('ember', 'exam', '--split=2', '--parallel=true');
    expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
    var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('uses parallel configuration and merges coverage when merge-coverage command is issued', async function () {
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    fs.copySync('tests/dummy/config/coverage-parallel.js', `${app.path}/config/coverage.js`);

    process.env.COVERAGE = 'true';

    await app.run('ember', 'exam', '--split=2', '--parallel=true');
    expect(dir(`${app.path}/coverage`)).to.not.exist;

    await app.run('ember', 'coverage-merge');
    expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
    var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('uses nested coverageFolder and parallel configuration and run merge-coverage', async function () {
    var coverageFolder = `${app.path}/coverage/abc/easy-as/123`;

    expect(dir(coverageFolder)).to.not.exist;
    fs.copySync('tests/dummy/config/coverage-nested-folder.js', `${app.path}/config/coverage.js`);

    process.env.COVERAGE = 'true';

    await app.run('ember', 'exam', '--split=2', '--parallel=true');
    expect(dir(coverageFolder)).to.not.exist;

    await app.run('ember', 'coverage-merge');
    expect(file(`${coverageFolder}/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${coverageFolder}/index.html`)).to.not.be.empty;
    var summary = fs.readJSONSync(`${coverageFolder}/coverage-summary.json`);
    expect(summary.total.lines.pct).to.equal(66.67);
  });

  it('runs coverage when a module has an import error', async function () {
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    fs.copySync('test/helpers/error-module.js', `${app.path}/app/error-module.js`);
    process.env.COVERAGE = 'true';

    await app.run('ember', 'test');
    expect(dir(`${app.path}/coverage`)).to.exist;

    await rimraf(`${app.path}/app/error-module.js`);
  });
});
