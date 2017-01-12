'use strict';

var fs = require('fs-extra');
var RSVP = require('rsvp');
var remove = RSVP.denodeify(fs.remove);
var runCommand = require('../helpers/run-command');
var chai = require('chai');
var expect = chai.expect;
var chaiFiles = require('chai-files');
var dir = chaiFiles.dir;
var file = chaiFiles.file;

chai.use(chaiFiles);

describe('`ember test`', function() {
  beforeEach(function() {
    return remove('coverage*');
  });

  afterEach(function() {
    return RSVP.all([
      remove('tests/dummy/config/coverage.js'),
      remove('tests/dummy/app/routes/index.js')
    ]);
  });

  it('runs coverage when env var is set', function() {
    this.timeout(100000);
    expect(dir('coverage')).to.not.exist;
    return runCommand('ember', ['test'], {env: {COVERAGE: true}}).then(function() {
      expect(file('coverage/lcov-report/index.html')).to.not.be.empty;
      expect(file('coverage/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync('coverage/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(100);
    });
  });

  it('does not run coverage when env var is NOT set', function() {
    this.timeout(100000);
    expect(dir('coverage')).to.not.exist;
    return runCommand('ember', ['test']).then(function() {
      expect(dir('coverage')).to.not.exist;
    });
  });

  it('uses the babel instrumenter when the configuration is set', function() {
    this.timeout(100000);
    fs.copySync('tests/dummy/config/coverage-babel.js', 'tests/dummy/config/coverage.js');
    return runCommand('ember', ['test'], {env: {COVERAGE: true}}).then(function() {
      expect(file('coverage/lcov-report/index.html')).to.not.be.empty;
      expect(file('coverage/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync('coverage/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(100);
    });
  });

  it('works with the babel instrumenter and ES2017 async functions', function() {
    this.timeout(100000);
    fs.copySync('tests/dummy/config/coverage-babel.js', 'tests/dummy/config/coverage.js');
    // We want something that will always be evaluated whenever the app starts.
    fs.writeFileSync('tests/dummy/app/routes/index.js', `
import Ember from 'ember';
export default Ember.Route.extend({
  async model() {
    return {};
  }
});
`);
    return runCommand('ember', ['test'], {env: {COVERAGE: true}}).then(function() {
      expect(file('coverage/lcov-report/index.html')).to.not.be.empty;
      expect(file('coverage/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync('coverage/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(100);
    });
  });

  it('uses parallel configuration and merges coverage when merge-coverage command is issued', function() {
    this.timeout(100000);
    expect(dir('coverage')).to.not.exist;
    fs.copySync('tests/dummy/config/coverage-parallel.js', 'tests/dummy/config/coverage.js');
    return runCommand('ember', ['exam', '--split=2', '--parallel=true'], {env: {COVERAGE: true}}).then(function() {
      expect(dir('coverage')).to.not.exist;
      return runCommand('ember', ['coverage-merge']);
    }).then(function() {
      expect(file('coverage/lcov-report/index.html')).to.not.be.empty;
      expect(file('coverage/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync('coverage/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/resolver.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/app.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/router.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/templates/application.hbs'].lines.pct).to.equal(100);
    });
  });

  it('uses nested coverageFolder and parallel configuration and run merge-coverage', function() {
    this.timeout(100000);
    var coverageFolder = 'coverage/abc/easy-as/123';

    expect(dir(coverageFolder)).to.not.exist;
    fs.copySync('config/coverage-nested-folder.js', 'config/coverage.js');
    return runCommand('ember', ['exam', '--split=2', '--parallel=true'], {env: {COVERAGE: true}}).then(function() {
      expect(dir(coverageFolder)).to.not.exist;
      return runCommand('ember', ['coverage-merge']);
    }).then(function() {
      expect(file(coverageFolder + '/lcov-report/index.html')).to.not.be.empty;
      expect(file(coverageFolder + '/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync(coverageFolder + '/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/resolver.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/app.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/router.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/templates/application.hbs'].lines.pct).to.equal(100);
    });
  });
});
