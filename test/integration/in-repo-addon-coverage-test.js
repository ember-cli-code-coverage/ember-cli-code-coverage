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
const InRepoAddon = require('../helpers/in-repo-addon');

chai.use(chaiFiles);

describe('in-repo addon coverage generation', function () {
  let app;

  this.timeout(10000000);

  beforeEach(async function () {
    app = new AddonTestApp();
    await app.create('my-app-with-in-repo-addon', {
      emberVersion: '3.4.0',
    });

    app.editPackageJSON(pkg => {
      delete pkg.devDependencies['ember-cli-eslint'];

      pkg.devDependencies['ember-exam'] = '1.0.0';
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

  it('runs coverage on in-repo addon', async function () {
    let addon = await InRepoAddon.generate(app, 'my-in-repo-addon');
    addon.editPackageJSON(pkg => (pkg.dependencies = { 'ember-cli-babel': '*' }));
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    process.env.COVERAGE = true;

    await app.run('ember', 'test');

    expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
    expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;

    const summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
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
