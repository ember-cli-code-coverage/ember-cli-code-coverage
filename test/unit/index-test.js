'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var Index = require('../../index.js');
describe('index.js', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    Index.registry = {
      extensionsForType: function() {
        return ['hbs'];
      }
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('contentFor', function() {
    describe('with coverage not enabled', function() {
      beforeEach(function() {
        sandbox.stub(Index, '_isCoverageEnabled').returns(false);
      });

      it('does nothing', function() {
        expect(Index.contentFor()).to.equal(undefined);
      });
    });

    describe('with coverage enabled', function() {
      beforeEach(function() {
        sandbox.stub(Index, '_isCoverageEnabled').returns(true);
        Index.fileLookup = {
          'some/module.js': 'some/file.js',
          'some/other/module.js': 'some/other/file.js'
        };
        Index.parent = {
          isEmberCLIAddon: function() {
            return false;
          }
        };
      });

      it('does nothing if type is not test-body-footer', function() {
        expect(Index.contentFor('test-head')).to.equal(undefined);
      });

      it('returns template for test-body-footer', function() {
        expect(Index.contentFor('test-body-footer')).to.match(/sendCoverage/);
      });

      it('includes the project name in the template for test-body-footer', function() {
        expect(Index.contentFor('test-body-footer')).to.match(/`["some/module", "some/other/module"`]/);
      });
    });
  });

  describe('serverMiddleware', function() {
    beforeEach(function() {
      sandbox.stub(Index, 'testemMiddleware');
      Index.serverMiddleware({
        app: 'foo-bar'
      });
    });

    it('calls testemMiddleware with correct arguments', function() {
      expect(Index.testemMiddleware.lastCall.args).to.eql(['foo-bar']);
    });
  });

  describe('testemMiddleware', function() {
    var app;

    beforeEach(function() {
      app = {
        post: sinon.spy()
      };

      Index.project = {
        root: '/path/to/foo-bar',
        configPath: sinon.stub().returns('tests/dummy/config/environment.js')
      };
    });

    describe('when coverage is enabled', function() {
      beforeEach(function() {
        sandbox.stub(Index, '_isCoverageEnabled').returns(true);
        Index.testemMiddleware(app);
      });

      it('adds POST endpoint to app', function() {
        expect(app.post.callCount).to.equal(1);
      });
    });

    describe('when coverage is not enabled', function() {
      beforeEach(function() {
        sandbox.stub(Index, '_isCoverageEnabled').returns(false);
        Index.testemMiddleware(app);
      });

      it('does not add POST endpoint to app', function() {
        expect(app.post.callCount).to.equal(0);
      });
    });
  });

  describe('_getExcludes', function() {
    beforeEach(function() {
      Index.parent = {
        isEmberCLIAddon: function() {
          return false;
        },
        name: function() {
          return 'test';
        }
      };
    });

    describe('when excludes not defined in config', function() {
      var results;

      beforeEach(function() {
        sandbox.stub(Index, '_getConfig').returns({});
        results = Index._getExcludes();
      });

      it('returns no excludes', function() {
        expect(results.length).to.equal(0);
      });

    });

    describe('when excludes defined in config', function() {
      var results;

      beforeEach(function() {
        sandbox.stub(Index, '_getConfig').returns({
          excludes: ['*/mirage/**/*']
        });

        results = Index._getExcludes();
      });

      it('returns one exclude', function() {
        expect(results.length).to.equal(1);
      });

      it('exclude is from config', function() {
        expect(results[0]).to.eql('*/mirage/**/*');
      });

    });
  });

  describe('_isCoverageEnabled', function() {
    beforeEach(function() {
      sandbox.stub(Index, '_getConfig').returns({
        coverageEnvVar: 'COVERAGE'
      });
    });

    describe('when coverage environment variable is true', function() {
      beforeEach(function() {
        process.env.COVERAGE = true;
      });

      it('returns true', function() {
        expect(Index._isCoverageEnabled()).to.be.true;
      });
    });

    describe('when coverage environment variable is string true', function() {
      beforeEach(function() {
        process.env.COVERAGE = 'true';
      });

      it('returns true', function() {
        expect(Index._isCoverageEnabled()).to.be.true;
      });
    });

    describe('when coverage environment variable is string TRUE', function() {
      beforeEach(function() {
        process.env.COVERAGE = 'TRUE';
      });

      it('returns true', function() {
        expect(Index._isCoverageEnabled()).to.be.true;
      });
    });

    describe('when coverage environment variable is false', function() {
      beforeEach(function() {
        process.env.COVERAGE = false;
      });

      it('returns false', function() {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is string false', function() {
      beforeEach(function() {
        process.env.COVERAGE = 'false';
      });

      it('returns false', function() {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is string FALSE', function() {
      beforeEach(function() {
        process.env.COVERAGE = 'FALSE';
      });

      it('returns false', function() {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is undefined', function() {
      beforeEach(function() {
        delete process.env.COVERAGE;
      });

      it('returns false', function() {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });

    describe('when coverage environment variable is null', function() {
      beforeEach(function() {
        process.env.COVERAGE = null;
      });

      it('returns false', function() {
        expect(Index._isCoverageEnabled()).to.be.false;
      });
    });
  });

  describe('_parentName', function() {
    var isAddon;

    beforeEach(function() {
      Index.parent = {
        name: function() {
          return 'parent-app';
        },
        isEmberCLIAddon: function() {
          return isAddon;
        }
      };
    });

    describe('when parent is an app', function() {
      beforeEach(function() {
        isAddon = false;
      });

      it('returns the app name', function() {
        expect(Index._parentName()).to.equal('parent-app');
      });
    });

    describe('when parent is an addon', function() {
      beforeEach(function() {
        isAddon = true;
        sandbox.stub(Index, '_findCoveredAddon').returns({ name: 'some-addon' });
      });

      it('returns the addon name', function() {
        expect(Index._parentName()).to.equal('some-addon');
      });
    });
  });

  describe('_findCoveredAddon', function() {
    var result;

    beforeEach(function() {
      Index.project = {
        findAddonByName: sinon.stub().returns({ name: 'my-addon' }),
        pkg: {
          name: '@scope/ember-cli-my-addon'
        }
      };

      result = Index._findCoveredAddon();
    });

    it('looks up the addon by the package name', function() {
      expect(Index.project.findAddonByName.calledWith('@scope/ember-cli-my-addon')).to.be.true;
    });

    it('returns the located addon', function() {
      expect(result.name).to.equal('my-addon');
    });
  });
});
