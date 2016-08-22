'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var Index = require('../../index.js');
describe('index.js', function() {
  var sandbox

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    Index.registry = {
      extensionsForType: function() {
        return ['hbs'];
      }
    };
  })

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
      });

      it('does nothing if type is not test-body-footer', function() {
        expect(Index.contentFor('test-head')).to.equal(undefined);
      });

      it('returns template for test-body-footer', function() {
        expect(Index.contentFor('test-body-footer')).to.match(/sendCoverage/);
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
        post: sinon.spy(),
        get: sinon.spy()
      };

      Index.project = {
        root: '/path/to/foo-bar'
      };
      Index.parent = {
        pkg: {
          name: 'foo-bar'
        }
      }
    });

    describe('when coverage is enabled', function() {
      beforeEach(function() {
        sandbox.stub(Index, '_isCoverageEnabled').returns(true);
        Index.testemMiddleware(app);
      });

      it('adds POST endpoints to app', function() {
        expect(app.post.callCount).to.equal(2);
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
      it('does not GET endpoint to app', function() {
        expect(app.get.callCount).to.equal(0);
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
        sandbox.stub(Index, '_existsSync').returns(true);
        result = Index._doesTemplateFileExist('app/templates/application.js');
      });

      it('uses path to hbs file', function() {
        expect(Index._existsSync.lastCall.args).to.eql(['app/templates/application.hbs']);
      });

      it('returns true', function() {
        expect(result).to.be.true;
      });
    });

    describe('when file does not exist', function() {
      var result;

      beforeEach(function() {
        sandbox.stub(Index, '_existsSync').returns(false);
        result = Index._doesTemplateFileExist('app/templates/application.js');
      });

      it('uses path to hbs file', function() {
        expect(Index._existsSync.lastCall.args).to.eql(['app/templates/application.hbs']);
      });

      it('returns false', function() {
        expect(result).to.be.false;
      });
    });
  });

  describe('_getEcludes', function() {
    beforeEach(function() {
      sandbox.stub(Index, '_filterOutAddonFiles').returns('test');

      Index.parent = {
        pkg: {
          name: 'foo-bar'
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
});
