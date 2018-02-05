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

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const InRepoAddon = require('../helpers/in-repo-addon');

chai.use(chaiFiles);

let app;

describe('in-repo addon coverage generation', function() {
  this.timeout(10000000);
  beforeEach(function() {
    app = new AddonTestApp({ skipNpm: true });
    return app.create('my-app-with-in-repo-addon', {
      emberVersion: '2.16.0'
    }).then(() => {
      app.editPackageJSON(pkg => {
        pkg.devDependencies['ember-exam'] = '0.7.0';
      });
      return app.run('npm', 'install').then(() => {
        return rimraf(`${app.path}/coverage*`);
      });
    });
  });

  afterEach(function() {
    return RSVP.all([
      rimraf(`${app.path}/config/coverage.js`)
    ]);
  });

  it('runs coverage on in-repo addon', co.wrap(function* () {
    let addon = yield InRepoAddon.generate(app, 'my-in-repo-addon');
    addon.editPackageJSON(
      pkg => (pkg.dependencies = { 'ember-cli-babel': '*' })
    );
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    process.env.COVERAGE = true;
    return app.run('ember', 'test').then(function() {
      expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
      expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
      var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
      expect(summary.total.lines.pct).to.equal(75);
      expect(summary['app/utils/my-covered-util-app.js'].lines.total).to.equal(1);
      expect(summary['lib/my-in-repo-addon/addon/utils/my-covered-util.js'].lines.total).to.equal(1);
    });
  }));
});
