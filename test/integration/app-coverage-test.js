'use strict';

var fs = require('fs-extra');
var RSVP = require('rsvp');
var rimraf = RSVP.denodeify(require('rimraf'));
var chai = require('chai');
var expect = chai.expect;
var chaiFiles = require('chai-files');
var dir = chaiFiles.dir;
var file = chaiFiles.file;
var path = require('path');

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

chai.use(chaiFiles);

let app;

describe('app coverage generation', function() {
  this.timeout(10000000);
  beforeEach(function() {
    app = new AddonTestApp();
    return app.create('my-app', {
      emberVersion: '2.16.0'
    }).then(() => {
      app.editPackageJSON(pkg => {
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

  it('runs coverage when env var is set', function() {
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    process.env.COVERAGE = true;
    return app.run('ember', 'test').then(function() {
      expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
      expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
      var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
      expect(summary.total.lines.pct).to.equal(83.33);
    });
  });

  it('does not run coverage when env var is NOT set', function() {
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    process.env.COVERAGE = false;
    return app.run('ember', 'test').then(function() {
      expect(dir(`${app.path}/coverage`)).to.not.exist;
    });
  });

  it('excludes files when the configuration is set', function() {
    fs.copySync('tests/dummy/config/coverage-excludes.js', `${app.path}/config/coverage.js`);
    process.env.COVERAGE = true;
    return app.run('ember', 'test').then(function() {
      expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
      expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
      var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
      expect(summary.total.lines.pct).to.equal(100);
    });
  });

  it('uses parallel configuration and merges coverage when merge-coverage command is issued', function() {
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    fs.copySync('tests/dummy/config/coverage-parallel.js', `${app.path}/config/coverage.js`);
    process.env.COVERAGE = true;
    return app.run('ember', 'exam', '--split=2', '--parallel=true').then(function() {
      expect(dir(`${app.path}/coverage`)).to.not.exist;
      return app.run('ember', 'coverage-merge');
    }).then(function() {
      expect(file(`${app.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
      expect(file(`${app.path}/coverage/index.html`)).to.not.be.empty;
      var summary = fs.readJSONSync(`${app.path}/coverage/coverage-summary.json`);
      expect(summary.total.lines.pct).to.equal(83.33);
    });
  });

  it('uses nested coverageFolder and parallel configuration and run merge-coverage', function() {
    var coverageFolder = `${app.path}/coverage/abc/easy-as/123`;

    expect(dir(coverageFolder)).to.not.exist;
    fs.copySync('tests/dummy/config/coverage-nested-folder.js', `${app.path}/config/coverage.js`);
    process.env.COVERAGE = true;
    return app.run('ember', 'exam', '--split=2', '--parallel=true').then(function() {
      expect(dir(coverageFolder)).to.not.exist;
      return app.run('ember', 'coverage-merge');
    }).then(function() {
      expect(file(`${coverageFolder}/lcov-report/index.html`)).to.not.be.empty;
      expect(file(`${coverageFolder}/index.html`)).to.not.be.empty;
      var summary = fs.readJSONSync(`${coverageFolder}/coverage-summary.json`);
      expect(summary.total.lines.pct).to.equal(83.33);
    });
  });

  it('runs coverage when a module has an import error', function() {
    expect(dir(`${app.path}/coverage`)).to.not.exist;
    fs.copySync('test/helpers/error-module.js', `${app.path}/app/error-module.js`);
    process.env.COVERAGE = true;
    return app.run('ember', 'test').then(function() {
      expect(dir(`${app.path}/coverage`)).to.exist;
      return rimraf(`${app.path}/app/error-module.js`);
    });
  });
});
