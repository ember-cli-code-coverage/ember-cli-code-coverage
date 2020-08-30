'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var Index = require('../../index.js');
var path = require('path');

describe('index.js', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    Index.parent = Index.project = Index.app = Index.IstanbulPlugin = Index.parentRegistry = null;
    sandbox.stub(Index, 'fileLookup').value({});
    sandbox.stub(Index, 'parentRegistry').value({
      extensionsForType() {
        return ['js'];
      },
    });
  });

  afterEach(function () {
    Index._coveredAddon = Index._inRepoAddons = null;
    sandbox.restore();
  });

  describe('contentFor', function () {
    describe('with coverage not enabled', function () {
      beforeEach(function () {
        sandbox.stub(Index, '_isCoverageEnabled').returns(false);
      });

      it('does nothing', function () {
        expect(Index.contentFor()).to.equal(undefined);
      });
    });

    describe('with coverage enabled', function () {
      beforeEach(function () {
        sandbox.stub(Index, '_isCoverageEnabled').returns(true);
        sandbox.stub(Index, 'fileLookup').value({
          'some/module.js': 'some/file.js',
          'some/other/module.js': 'some/other/file.js',
        });
        sandbox.stub(Index, 'parent').value({
          isEmberCLIAddon() {
            return false;
          },
        });
      });

      it('does nothing if type is not test-body-footer', function () {
        expect(Index.contentFor('test-head')).to.equal(undefined);
      });

      it('returns template for test-body-footer', function () {
        expect(Index.contentFor('test-body-footer')).to.match(/sendCoverage/);
      });

      it('includes the project name in the template for test-body-footer', function () {
        expect(Index.contentFor('test-body-footer')).to.include(
          `["some/module","some/other/module"]`
        );
      });
    });
  });

  describe('serverMiddleware', function () {
    var app;

    beforeEach(function () {
      app = {
        post: sinon.spy(),
      };

      sandbox.stub(Index, 'project').value({
        root: '/path/to/foo-bar',
        configPath: sinon.stub().returns('tests/dummy/config/environment.js'),
      });
    });

    describe('when coverage is enabled', function () {
      beforeEach(function () {
        sandbox.stub(Index, '_isCoverageEnabled').returns(true);
        Index.serverMiddleware({ app });
      });

      it('adds POST endpoint to app', function () {
        expect(app.post.callCount).to.equal(1);
      });
    });

    describe('when coverage is not enabled', function () {
      beforeEach(function () {
        sandbox.stub(Index, '_isCoverageEnabled').returns(false);
        Index.serverMiddleware({ app });
      });

      it('does not add POST endpoint to app', function () {
        expect(app.post.callCount).to.equal(0);
      });
    });
  });

  describe('testemMiddleware', function () {
    var app;

    beforeEach(function () {
      app = {
        post: sinon.spy(),
      };

      sandbox.stub(Index, 'project').value({
        root: '/path/to/foo-bar',
        configPath: sinon.stub().returns('tests/dummy/config/environment.js'),
      });
    });

    describe('when coverage is enabled', function () {
      beforeEach(function () {
        sandbox.stub(Index, '_isCoverageEnabled').returns(true);
        Index.testemMiddleware(app);
      });

      it('adds POST endpoint to app', function () {
        expect(app.post.callCount).to.equal(1);
      });
    });

    describe('when coverage is not enabled', function () {
      beforeEach(function () {
        sandbox.stub(Index, '_isCoverageEnabled').returns(false);
        Index.testemMiddleware(app);
      });

      it('does not add POST endpoint to app', function () {
        expect(app.post.callCount).to.equal(0);
      });
    });
  });

  describe('_getIncludesForDir', function () {
    beforeEach(function () {
      sandbox.stub(Index, 'project').value({ root: 'test/fixtures/my-addon/' });
    });

    it('gets files to include from the app directory', function () {
      Index._getIncludesForDir('test/fixtures/my-addon/app', 'my-app');
      expect(Index.fileLookup).to.deep.equal({
        'my-app/utils/my-covered-util.js': 'app/utils/my-covered-util.js',
        'my-app/utils/my-uncovered-util.js': 'app/utils/my-uncovered-util.js',
      });
    });

    it('gets files to include from the addon directory', function () {
      Index._getIncludesForDir('test/fixtures/my-addon/addon', 'my-addon');
      expect(Index.fileLookup).to.deep.equal({
        'my-addon/utils/my-covered-util.js': 'addon/utils/my-covered-util.js',
        'my-addon/utils/my-uncovered-util.js': 'addon/utils/my-uncovered-util.js',
      });
    });
  });

  describe('_getExcludes', function () {
    beforeEach(function () {
      sandbox.stub(Index, 'parent').value({
        isEmberCLIAddon() {
          return false;
        },
        name() {
          return 'test';
        },
      });
    });

    describe('when excludes not defined in config', function () {
      var results;

      beforeEach(function () {
        sandbox.stub(Index, '_getConfig').returns({});
        results = Index._getExcludes();
      });

      it('returns no excludes', function () {
        expect(results.length).to.equal(0);
      });
    });

    describe('when excludes defined in config', function () {
      var results;

      beforeEach(function () {
        sandbox.stub(Index, '_getConfig').returns({
          excludes: ['*/mirage/**/*'],
        });

        results = Index._getExcludes();
      });

      it('returns one exclude', function () {
        expect(results.length).to.equal(1);
      });

      it('exclude is from config', function () {
        expect(results[0]).to.eql('*/mirage/**/*');
      });
    });
  });

  describe('_isCoverageEnabled', function () {
    beforeEach(function () {
      sandbox.stub(Index, '_getConfig').returns({
        coverageEnvVar: 'COVERAGE',
      });
    });

    describe('when coverage environment variable is true', function () {
      beforeEach(function () {
        process.env.COVERAGE = true;
      });

      it('returns true', function () {
        expect(Index._isCoverageEnabled()).to.be.true;
      });
    });

    describe('when coverage environment variable is string true', function () {
      beforeEach(function () {
        process.env.COVERAGE = 'true';
      });

      it('returns true', function () {
        expect(Index._isCoverageEnabled()).to.be.true;
      });
    });

    describe('when coverage environment variable is string TRUE', function () {
      beforeEach(function () {
        process.env.COVERAGE = 'TRUE';
      });

      it('returns true', function () {
        expect(Index._isCoverageEnabled()).to.be.true;
      });
    });

    describe('when coverage environment variable is false', function () {
      beforeEach(function () {
        process.env.COVERAGE = false;
      });

      it('returns false', function () {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is string false', function () {
      beforeEach(function () {
        process.env.COVERAGE = 'false';
      });

      it('returns false', function () {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is string FALSE', function () {
      beforeEach(function () {
        process.env.COVERAGE = 'FALSE';
      });

      it('returns false', function () {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is undefined', function () {
      beforeEach(function () {
        delete process.env.COVERAGE;
      });

      it('returns false', function () {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is null', function () {
      beforeEach(function () {
        process.env.COVERAGE = null;
      });

      it('returns false', function () {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });
  });

  describe('_findCoveredAddon', function () {
    var result;

    beforeEach(function () {
      sandbox.stub(Index, 'project').value({
        findAddonByName: sinon.stub().returns({ name: 'my-addon' }),
        pkg: {
          name: '@scope/ember-cli-my-addon',
        },
      });
      result = Index._findCoveredAddon();
    });

    it('looks up the addon by the package name', function () {
      expect(Index.project.findAddonByName.calledWith('@scope/ember-cli-my-addon')).to.be.true;
    });

    it('returns the located addon', function () {
      expect(result.name).to.equal('my-addon');
    });
  });

  describe('_getIncludes', function () {
    beforeEach(function () {
      sandbox.stub(Index, 'IstanbulPlugin').value('istanbul');
      sandbox.stub(Index, '_getExcludes').returns([]);
      sandbox.stub(Index, 'project').value({ root: 'test/fixtures/my-addon/' });
      sandbox.stub(Index, 'parent').value({
        name() {
          return 'my-app';
        },
      });
      sandbox.stub(Index, 'app').value({});
    });

    describe('_getIncludesForAppDirectory', function () {
      describe('for an app', function () {
        beforeEach(function () {
          sandbox.stub(Index, 'parent').value({
            name() {
              return 'my-app';
            },
            isEmberCLIAddon() {
              return false;
            },
          });
        });

        it('gets includes for the app directory', function () {
          const includes = Index._getIncludesForAppDirectory();
          expect(includes).to.deep.equal([
            'my-app/utils/my-covered-util.js',
            'my-app/utils/my-uncovered-util.js',
          ]);
          expect(Index.fileLookup).to.deep.equal({
            'my-app/utils/my-covered-util.js': 'app/utils/my-covered-util.js',
            'my-app/utils/my-uncovered-util.js': 'app/utils/my-uncovered-util.js',
          });
        });
      });

      describe('for an addon', function () {
        beforeEach(function () {
          sandbox.stub(Index, 'parent').value({
            name() {
              return 'my-app';
            },
            isEmberCLIAddon() {
              return true;
            },
          });
        });

        it('gets includes for the app directory', function () {
          const includes = Index._getIncludesForAppDirectory();
          expect(includes).to.deep.equal([
            'dummy/utils/my-covered-util.js',
            'dummy/utils/my-uncovered-util.js',
          ]);
          expect(Index.fileLookup).to.deep.equal({
            'dummy/utils/my-covered-util.js': 'app/utils/my-covered-util.js',
            'dummy/utils/my-uncovered-util.js': 'app/utils/my-uncovered-util.js',
          });
        });
      });
    });

    describe('_getIncludesForAddonDirectory', function () {
      describe('for an app', function () {
        beforeEach(function () {
          sandbox.stub(Index, '_findCoveredAddon').returns(null);
          sandbox.spy(Index, '_getIncludesForDir');
        });

        it('does not get includes for the addon directory', function () {
          const includes = Index._getIncludesForAddonDirectory();
          expect(includes).to.deep.equal([]);
          sinon.assert.notCalled(Index._getIncludesForDir);
        });
      });

      describe('for an addon without a moduleName method defined', function () {
        let addon = {
          name: 'my-addon',
        };

        beforeEach(function () {
          sandbox.stub(Index, '_findCoveredAddon').returns(addon);
        });

        afterEach(function () {
          addon = null;
        });

        it('gets includes for the addon directory', function () {
          const includes = Index._getIncludesForAddonDirectory();
          expect(includes).to.deep.equal([
            'my-addon/utils/my-covered-util.js',
            'my-addon/utils/my-uncovered-util.js',
            'my-addon/test-support/uncovered-test-support.js',
          ]);
          expect(Index.fileLookup).to.deep.equal({
            'my-addon/test-support/uncovered-test-support.js':
              'addon-test-support/uncovered-test-support.js',
            'my-addon/utils/my-covered-util.js': 'addon/utils/my-covered-util.js',
            'my-addon/utils/my-uncovered-util.js': 'addon/utils/my-uncovered-util.js',
          });
        });
      });

      describe('for an addon with a moduleName method defined', function () {
        let addon = {
          moduleName: () => 'my-addon',
        };

        beforeEach(function () {
          sandbox.stub(Index, '_findCoveredAddon').returns(addon);
        });

        afterEach(function () {
          addon = null;
        });

        it('gets includes for the addon directory', function () {
          const includes = Index._getIncludesForAddonDirectory();
          expect(includes).to.deep.equal([
            'my-addon/utils/my-covered-util.js',
            'my-addon/utils/my-uncovered-util.js',
            'my-addon/test-support/uncovered-test-support.js',
          ]);
          expect(Index.fileLookup).to.deep.equal({
            'my-addon/test-support/uncovered-test-support.js':
              'addon-test-support/uncovered-test-support.js',
            'my-addon/utils/my-covered-util.js': 'addon/utils/my-covered-util.js',
            'my-addon/utils/my-uncovered-util.js': 'addon/utils/my-uncovered-util.js',
          });
        });
      });
    });

    describe('_getIncludesForInRepoAddonDirectories', function () {
      describe('for an app with no inrepo addons', function () {
        beforeEach(function () {
          sandbox.stub(Index, 'project').value({ pkg: {} });
          sandbox.spy(Index, '_getIncludesForDir');
        });

        it('does not instrument any inrepo addon directories', function () {
          const includes = Index._getIncludesForInRepoAddonDirectories();
          expect(includes).to.deep.equal([]);
          sinon.assert.notCalled(Index._getIncludesForDir);
        });
      });

      describe('for an app with an inrepo addon', function () {
        let addon = { name: 'my-in-repo-addon' };

        beforeEach(function () {
          sandbox.stub(path, 'basename').returns('my-in-repo-addon');
          sandbox.stub(Index, 'project').value({
            pkg: {
              'ember-addon': {
                paths: [''],
              },
            },
            root: 'test/fixtures/my-app-with-in-repo-addon/',
            findAddonByName() {
              return addon;
            },
          });
        });

        afterEach(function () {
          addon = null;
        });

        it('instruments the inrepo addon', function () {
          const includes = Index._getIncludesForInRepoAddonDirectories();
          expect(includes).to.deep.equal([
            'my-app/utils/my-covered-util.js',
            'my-app/utils/my-uncovered-util.js',
            'my-in-repo-addon/utils/my-covered-util.js',
            'my-in-repo-addon/utils/my-uncovered-util.js',
            'my-in-repo-addon/test-support/uncovered-test-support.js',
          ]);
          expect(Index.fileLookup).to.deep.equal({
            'my-app/utils/my-covered-util.js': 'lib/my-in-repo-addon/app/utils/my-covered-util.js',
            'my-app/utils/my-uncovered-util.js':
              'lib/my-in-repo-addon/app/utils/my-uncovered-util.js',
            'my-in-repo-addon/utils/my-covered-util.js':
              'lib/my-in-repo-addon/addon/utils/my-covered-util.js',
            'my-in-repo-addon/utils/my-uncovered-util.js':
              'lib/my-in-repo-addon/addon/utils/my-uncovered-util.js',
            'my-in-repo-addon/test-support/uncovered-test-support.js':
              'lib/my-in-repo-addon/addon-test-support/uncovered-test-support.js',
          });
        });
      });
    });
  });
});
