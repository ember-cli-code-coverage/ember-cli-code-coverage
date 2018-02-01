'use strict';

var fs = require('fs-extra');
var RSVP = require('rsvp');
var remove = RSVP.denodeify(fs.remove);
var chai = require('chai');
var expect = chai.expect;
var chaiFiles = require('chai-files');
var dir = chaiFiles.dir;
var file = chaiFiles.file;

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

chai.use(chaiFiles);

let addon;

describe.skip('addon coverage generation', function() {
  this.timeout(10000000);
  beforeEach(function() {
    addon = new AddonTestApp();
    return addon.create('my-addon', {
      emberVersion: '2.16.0'
    }).then(() => {
      return remove(`${addon.path}/coverage*`);
    });
  });
  //
  // afterEach(function() {
  //   return RSVP.all([
  //     remove('tests/dummy/config/coverage.js'),
  //     remove('tests/dummy/app/routes/index.js')
  //   ]);
  // });
  //
  // it('runs coverage when env var is set', function() {
  //   expect(dir(`${addon.path}/coverage`)).to.not.exist;
  //   process.env.COVERAGE = true;
  //   return addon.run('ember', 'test').then(function() {
  //     expect(file(`${addon.path}/coverage/lcov-report/index.html`)).to.not.be.empty;
  //     expect(file(`${addon.path}/coverage/index.html`)).to.not.be.empty;
  //     var summary = fs.readJSONSync(`${addon.path}/coverage/coverage-summary.json`);
  //     expect(summary.total.lines.pct).to.equal(50);
  //   });
  // });
  //
  // it('does not run coverage when env var is NOT set', function() {
  //   this.timeout(100000);
  //   expect(dir('coverage')).to.not.exist;
  //   return runCommand('ember', ['test']).then(function() {
  //     expect(dir('coverage')).to.not.exist;
  //   });
  // });
  //
  // it('excludes files when the configuration is set', function() {
  //   this.timeout(100000);
  //   fs.copySync('tests/dummy/config/coverage-excludes.js', 'tests/dummy/config/coverage.js');
  //   return runCommand('ember', ['test'], {env: {COVERAGE: true}}).then(function() {
  //     expect(file('coverage/lcov-report/index.html')).to.not.be.empty;
  //     expect(file('coverage/index.html')).to.not.be.empty;
  //     var summary = fs.readJSONSync('coverage/coverage-summary.json');
  //     expect(summary.total.lines.pct).to.equal(100);
  //   });
  // });
  //
  // it('uses parallel configuration and merges coverage when merge-coverage command is issued', function() {
  //   this.timeout(100000);
  //   expect(dir('coverage')).to.not.exist;
  //   fs.copySync('tests/dummy/config/coverage-parallel.js', 'tests/dummy/config/coverage.js');
  //   return runCommand('ember', ['exam', '--split=2', '--parallel=true'], {env: {COVERAGE: true}}).then(function() {
  //     expect(dir('coverage')).to.not.exist;
  //     return runCommand('ember', ['coverage-merge']);
  //   }).then(function() {
  //     expect(file('coverage/lcov-report/index.html')).to.not.be.empty;
  //     expect(file('coverage/index.html')).to.not.be.empty;
  //     var summary = fs.readJSONSync('coverage/coverage-summary.json');
  //     expect(summary.total.lines.pct).to.equal(50);
  //   });
  // });
  //
  // it('uses nested coverageFolder and parallel configuration and run merge-coverage', function() {
  //   this.timeout(100000);
  //   var coverageFolder = 'coverage/abc/easy-as/123';
  //
  //   expect(dir(coverageFolder)).to.not.exist;
  //   fs.copySync('tests/dummy/config/coverage-nested-folder.js', 'tests/dummy/config/coverage.js');
  //   return runCommand('ember', ['exam', '--split=2', '--parallel=true'], {env: {COVERAGE: true}}).then(function() {
  //     expect(dir(coverageFolder)).to.not.exist;
  //     return runCommand('ember', ['coverage-merge']);
  //   }).then(function() {
  //     expect(file(coverageFolder + '/lcov-report/index.html')).to.not.be.empty;
  //     expect(file(coverageFolder + '/index.html')).to.not.be.empty;
  //     var summary = fs.readJSONSync(coverageFolder + '/coverage-summary.json');
  //     expect(summary.total.lines.pct).to.equal(50);
  //   });
  // });
});
