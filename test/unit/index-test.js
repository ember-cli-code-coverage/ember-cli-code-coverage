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
        Index.parent = {
          isEmberCLIAddon: function() {
            return false;
          },
          name: function() {
            return 'fake-app';
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
        expect(Index.contentFor('test-body-footer')).to.match(/fake-app/);
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

  describe('_doesFileExistInCurrentProjectApp', function() {
    describe('when file exists', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(true);
        result = Index._doesFileExistInCurrentProjectApp('adapters/application.js');
      });

      it('uses path to file in app', function() {
        expect(Index._existsSync.lastCall.args).to.eql(['app/adapters/application.js']);
      });

      it('returns true', function() {
        expect(result).to.be.true;
      });
    });

    describe('when file does not exist', function() {
      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(false);
      });

      describe('when template file exists', function() {
        var result;

        beforeEach(function() {
          sandbox.stub(Index, '_doesTemplateFileExist').returns(true);
          result = Index._doesFileExistInCurrentProjectApp('templates/application.js');
        });

        it('uses path to file in app', function() {
          expect(Index._existsSync.lastCall.args).to.eql(['app/templates/application.js']);
        });

        it('returns true', function() {
          expect(result).to.be.true;
        });
      });

      describe('when template file does not exist', function() {
        var result;

        beforeEach(function() {
          sandbox.stub(Index, '_doesTemplateFileExist').returns(false);
          result = Index._doesFileExistInCurrentProjectApp('templates/application.js');
        });

        it('uses path to file in app', function() {
          expect(Index._existsSync.lastCall.args).to.eql(['app/templates/application.js']);
        });

        it('returns false', function() {
          expect(result).to.be.false;
        });
      });
    });
  });

  describe('_doesFileExistInDummyApp', function() {
    describe('when file exists', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(true);
        result = Index._doesFileExistInDummyApp('adapters/application.js');
      });

      it('uses path to file in dummy app', function() {
        expect(Index._existsSync.lastCall.args).to.eql(['tests/dummy/app/adapters/application.js']);
      });

      it('returns true', function() {
        expect(result).to.be.true;
      });
    });

    describe('when file does not exist', function() {
      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(false);
      });

      describe('when template file exists', function() {
        var result;

        beforeEach(function() {
          sandbox.stub(Index, '_doesTemplateFileExist').returns(true);
          result = Index._doesFileExistInDummyApp('templates/application.js');
        });

        it('uses path to file in dummy app', function() {
          expect(Index._existsSync.lastCall.args).to.eql(['tests/dummy/app/templates/application.js']);
        });

        it('returns true', function() {
          expect(result).to.be.true;
        });
      });

      describe('when template file does not exist', function() {
        var result;

        beforeEach(function() {
          sandbox.stub(Index, '_doesTemplateFileExist').returns(false);
          result = Index._doesFileExistInDummyApp('templates/application.js');
        });

        it('uses path to file in dummy app', function() {
          expect(Index._existsSync.lastCall.args).to.eql(['tests/dummy/app/templates/application.js']);
        });

        it('returns false', function() {
          expect(result).to.be.false;
        });
      });
    });
  });

  describe('_doesTemplateFileExist', function() {
    describe('when file exists', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_doesPrecompiledFileExist').returns(true);
        result = Index._doesTemplateFileExist('app/templates/application.js');
      });

      it('uses path to hbs file', function() {
        expect(Index._doesPrecompiledFileExist.lastCall.args).to.eql(['app/templates/application.js', ['hbs']]);
      });

      it('returns true', function() {
        expect(result).to.be.true;
      });
    });

    describe('when file does not exist', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_doesPrecompiledFileExist').returns(false);
        result = Index._doesTemplateFileExist('app/templates/application.js');
      });

      it('uses path to hbs file', function() {
        expect(Index._doesPrecompiledFileExist.lastCall.args).to.eql(['app/templates/application.js', ['hbs']]);
      });

      it('returns false', function() {
        expect(result).to.be.false;
      });
    });
  });

  describe('_doesFileExistAsTranspilationSource', function () {
    describe('when file exists', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_doesPrecompiledFileExist').returns(true);
        sandbox.stub(Index, '_getTranspiledSourceExtensions').returns(['ts']);
        result = Index._doesFileExistAsTranspilationSource('app/utils/file.js');
      });

      it('uses path to ts file', function() {
        expect(Index._doesPrecompiledFileExist.lastCall.args).to.eql(['app/utils/file.js', ['ts']]);
      });

      it('returns true', function() {
        expect(result).to.be.true;
      });
    });

    describe('when file does not exist', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_doesPrecompiledFileExist').returns(false);
        sandbox.stub(Index, '_getTranspiledSourceExtensions').returns(['ts']);
        result = Index._doesFileExistAsTranspilationSource('app/utils/file.js');
      });

      it('uses path to ts file', function() {
        expect(Index._doesPrecompiledFileExist.lastCall.args).to.eql(['app/utils/file.js', ['ts']]);
      });

      it('returns true', function() {
        expect(result).to.be.false;
      });
    });
  });

  describe('_doesPrecompiledFileExist', function() {
    describe('when file is not precompiled', function() {
      var result;
      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(false);
        result = Index._doesPrecompiledFileExist('app/utils/file.js');
      });

      it('should not check if a file exists', function() {
        expect(Index._existsSync).not.to.have.been.called;
      });

      it('returns true', function() {
        expect(result).to.be.false;
      });
    });

    describe('when precompiled file exists', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(true);
        result = Index._doesPrecompiledFileExist('app/utils/file.js', ['ts']);
      });

      it('uses path to ts file', function() {
        expect(Index._existsSync.lastCall.args).to.eql(['app/utils/file.ts']);
      });

      it('returns true', function() {
        expect(result).to.be.true;
      });
    });

    describe('when precompiled file does not exist', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(false);
        result = Index._doesPrecompiledFileExist('app/utils/file.js', ['ts']);
      });

      it('uses path to ts file', function() {
        expect(Index._existsSync.lastCall.args).to.eql(['app/utils/file.ts']);
      });

      it('returns false', function() {
        expect(result).to.be.false;
      });
    });
  });

  describe('_getTranspiledSourceExtensions', function() {
    describe('when includeTranspiledSources not defined in config', function() {
      var results;

      beforeEach(function() {
        sandbox.stub(Index, '_getConfig').returns({});
        results = Index._getTranspiledSourceExtensions();
      });

      it('return no extensions', function() {
        expect(results.length).to.equal(0);
      });
    });

    describe('when _getTranspiledSourceExtensions is defined in config', function() {
      var results;

      beforeEach(function() {
        sandbox.stub(Index, '_getConfig').returns({
          includeTranspiledSources: ['ts', 'coffee']
        });

        results = Index._getTranspiledSourceExtensions();
      });

      it('returns two extensions', function() {
        expect(results.length).to.equal(2);
      });
    });
  });

  describe('_getExcludes', function() {
    beforeEach(function() {
      sandbox.stub(Index, '_filterOutAddonFiles').returns('test');

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

      it('returns one exclude', function() {
        expect(results.length).to.equal(1);
      });

      it('exclude is a function', function() {
        expect(typeof results[0]).to.equal('function');
      });

      it('exclude is expected function', function() {
        expect(results[0]()).to.equal('test');
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

      it('returns two excludes', function() {
        expect(results.length).to.equal(2);
      });

      it('first exclude is from config', function() {
        expect(results[0]).to.eql('*/mirage/**/*');
      });

      it('second exclude is a function', function() {
        expect(typeof results[1]).to.equal('function');
      });

      it('second exclude is expected function', function() {
        expect(results[1]()).to.equal('test');
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
