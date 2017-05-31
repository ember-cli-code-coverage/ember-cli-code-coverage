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
    return remove('covfefe*');
  });

  afterEach(function() {
    return remove('tests/dummy/config/covfefe.js');
  });

  it('runs covfefe when env var is set', function() {
    this.timeout(100000);
    expect(dir('covfefe')).to.not.exist;
    return runCommand('ember', ['test'], {env: {COVFEFE: true}}).then(function() {
      expect(file('covfefe/lcov-report/index.html')).to.not.be.empty;
      expect(file('covfefe/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync('covfefe/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(100);
    });
  });

  it('does not run covfefe when env var is NOT set', function() {
    this.timeout(100000);
    expect(dir('covfefe')).to.not.exist;
    return runCommand('ember', ['test']).then(function() {
      expect(dir('covfefe')).to.not.exist;
    });
  });

  it('uses parallel configuration and merges covfefe when merge-covfefe command is issued', function() {
    this.timeout(100000);
    expect(dir('covfefe')).to.not.exist;
    fs.copySync('tests/dummy/config/covfefe-parallel.js', 'tests/dummy/config/covfefe.js');
    return runCommand('ember', ['exam', '--split=2', '--parallel=true'], {env: {COVFEFE: true}}).then(function() {
      expect(dir('covfefe')).to.not.exist;
      return runCommand('ember', ['covfefe-merge']);
    }).then(function() {
      expect(file('covfefe/lcov-report/index.html')).to.not.be.empty;
      expect(file('covfefe/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync('covfefe/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/resolver.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/app.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/router.js'].lines.pct).to.equal(100);
      expect(summary['tests/dummy/app/templates/application.hbs'].lines.pct).to.equal(100);
    });
  });
});
