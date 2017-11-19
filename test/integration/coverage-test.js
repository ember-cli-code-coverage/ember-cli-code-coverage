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
      expect(summary.total.lines.pct).to.equal(50);
    });
  });

  it('does not run coverage when env var is NOT set', function() {
    this.timeout(100000);
    expect(dir('coverage')).to.not.exist;
    return runCommand('ember', ['test']).then(function() {
      expect(dir('coverage')).to.not.exist;
    });
  });

  it('merges coverage when tests are run in parallel', function() {
    this.timeout(100000);
    expect(dir('coverage')).to.not.exist;
    return runCommand('ember', ['exam', '--split=2', '--parallel=true'], {env: {COVERAGE: true}}).then(function() {
      expect(file('coverage/lcov-report/index.html')).to.not.be.empty;
      expect(file('coverage/index.html')).to.not.be.empty;
      var summary = fs.readJSONSync('coverage/coverage-summary.json');
      expect(summary.total.lines.pct).to.equal(50);
      expect(summary['addon/components/my-covered-component.js'].lines.pct).to.equal(100);
      expect(summary['addon/components/my-uncovered-component.js'].lines.pct).to.equal(0);
      expect(summary['addon/utils/my-covered-util.js'].lines.pct).to.equal(100);
      expect(summary['addon/utils/my-uncovered-util.js'].lines.pct).to.equal(0);
    });
  });
});
