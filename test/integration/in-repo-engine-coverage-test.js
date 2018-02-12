'use strict';

var fs = require('fs-extra');
var RSVP = require('rsvp');
var rimraf = RSVP.denodeify(require('rimraf'));
var chai = require('chai');
const co = require('co');
var expect = chai.expect;
var chaiFiles = require('chai-files');
var dir = chaiFiles.dir;
var file = chaiFiles.file;
var path = require('path');

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const InRepoEngine = require('../helpers/in-repo-engine');

chai.use(chaiFiles);

let app;

describe('in-repo engine coverage generation', function() {
  this.timeout(10000000);
  beforeEach(function() {
    app = new AddonTestApp();
    return app.create('my-app-with-in-repo-engine', {
      emberVersion: '2.16.0'
    }).then(() => {
      app.editPackageJSON(pkg => {
        pkg.devDependencies['ember-engines'] = '0.5.14';
        pkg.devDependencies['ember-exam'] = '0.7.0';
        // Temporarily remove the addon before install to work around https://github.com/tomdale/ember-cli-addon-tests/issues/176
        delete pkg.devDependencies['ember-cli-code-coverage'];
      });
      return app.run('npm', 'install').then(() => {
        app.editPackageJSON(pkg => {
          pkg.devDependencies['ember-cli-code-coverage'] = '*';
        });
        let addonPath = path.join(app.path, 'node_modules', 'ember-cli-code-coverage');
        fs.removeSync(addonPath);
        fs.ensureSymlinkSync(process.cwd(), addonPath);
        return rimraf(`${app.path}/coverage*`);
      });
    });
  });

  afterEach(function() {
    return RSVP.all([
      rimraf(`${app.path}/config/coverage.js`)
    ]);
  });

  it('runs coverage on in-repo engine', co.wrap(function* () {
    let engine = yield InRepoEngine.generate(app, 'my-in-repo-engine', {
      lazy: false
    });
    engine.editPackageJSON(
      pkg => (pkg.dependencies = {
        'ember-cli-babel': '*',
        'ember-cli-htmlbars': '*',
      })
    );
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    process.env.COVERAGE = true;
    return app.run('ember', 'test').then(function() {
      expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
      expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;

      const summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
      expect(summary.total.lines.pct).to.equal(75);
      expect(summary['app/utils/my-covered-util-app.js'].lines.total).to.equal(1);

      // Check that lib/my-in-repo-engine/utils/my-covered-utill is 1 line and that 1 line is covered
      expect(summary['lib/my-in-repo-engine/addon/utils/my-covered-util.js'].lines.total).to.equal(1);
      expect(summary['lib/my-in-repo-engine/addon/utils/my-covered-util.js'].lines.covered).to.equal(1);

      // Check that lib/my-in-repo-engine/utils/my-uncovered-utill is 1 line and that 0 lines are covered
      expect(summary['lib/my-in-repo-engine/addon/utils/my-uncovered-util.js'].lines.total).to.equal(1);
      expect(summary['lib/my-in-repo-engine/addon/utils/my-uncovered-util.js'].lines.covered).to.equal(0);
    });
  }));
});
