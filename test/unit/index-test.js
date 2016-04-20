'use strict';

var chai = require('chai');
var expect = chai.expect;

var Index = require('../../index.js');
var originalCoverageEnabled = Index._coverageIsEnabled;

describe('index.js', function() {
  afterEach(function() {
    Index._coverageIsEnabled = originalCoverageEnabled;
  });

  describe('contentFor', function() {
    describe('with coverage not enabled', function() {
      beforeEach(function() {
        Index._coverageIsEnabled = returnFalse;
      });

      it('does nothing', function() {
        expect(Index.contentFor()).to.equal(undefined);
      });
    });

    describe('with coverage enabled', function() {
      beforeEach(function() {
        Index._coverageIsEnabled = returnTrue;
      });

      it('does nothing if type is not test-body-footer', function() {
        expect(Index.contentFor('test-head')).to.equal(undefined);
      });

      it('returns template for test-body-footer', function() {
        expect(Index.contentFor('test-body-footer')).to.match(/sendCoverage/);
      });
    });
  });
});

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}
