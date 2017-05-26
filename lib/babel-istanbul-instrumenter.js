/**
 * This is a modified copy of the isparta instrumenter
 * @reference: https://github.com/douglasduteil/isparta/blob/master/src/instrumenter.js
 */

var extend = require('extend');
var istanbul = require('istanbul');
var babelTransform = require('babel-core').transform;
var esprima = require('esprima');
var escodegen = require('escodegen');
var SourceMapConsumer = require('source-map').SourceMapConsumer;

var POSITIONS = ['start', 'end'];

function Instrumenter(options) {
  if (!options) {
    options = {};
  }

  istanbul.Instrumenter.call(this, options); // Call super constructor

  this.babelOptions = extend({
    sourceMap: true
  }, options && options.babel || {});
  this.plugins = options.plugins;

  return this;
}

// Make custom instrumenter extend istanbul instrumenter
Instrumenter.prototype = Object.create(istanbul.Instrumenter.prototype);
Instrumenter.prototype.constructor = Instrumenter;

Instrumenter.prototype.instrumentSync = function(code, fileName) {
  var plugins = this.babelOptions.plugins;
  // If we're running in coverage, we're assuming that this is running in CI or in some
  // form of test scenario and not being built for production. So it's fine to always
  // force this plugin to work.
  for (var plugin of this.plugins) {
    plugins.push(require(plugin));
  }
  var result = this._r = (0, babelTransform)(code, extend({}, this.babelOptions, { filename: fileName }));
  this._babelMap = new SourceMapConsumer(result.map);

  // PARSE
  var program = esprima.parse(result.code, {
    loc: true,
    range: true,
    tokens: this.opts.preserveComments,
    comment: true,
    sourceType: 'module'
  });

  if (this.opts.preserveComments) {
    program = escodegen.attachComments(program, program.comments, program.tokens);
  }

  return this.instrumentASTSync(program, fileName, code);
};

Instrumenter.prototype.getPreamble = function(sourceCode, emitUseStrict) {
  [
    ['s', 'statementMap'],
    ['f', 'fnMap'],
    ['b', 'branchMap']
  ]
    .forEach(function(info) {
      var metricName = info[0];
      var metricMapName = info[1];
      var metrics = this.coverState[metricName];
      var metricMap = this.coverState[metricMapName];
      var transformFctName = '_' + metricMapName + 'Transformer';
      var transformedMetricMap = this[transformFctName](metricMap, metrics);
      this.coverState[metricMapName] = transformedMetricMap;
    }.bind(this));

  return istanbul.Instrumenter.prototype.getPreamble.call(this, sourceCode, emitUseStrict);
};

Instrumenter.prototype._statementMapTransformer = function(metrics) {
  return Object.keys(metrics)
    .map(function(index) {
      return metrics[index];
    })
    .map(function(statementMeta) {
      return this._getMetricOriginalLocations([statementMeta])[0];
    }.bind(this))
    .reduce(this._arrayToArrayLikeObject, {});
};

Instrumenter.prototype._fnMapTransformer = function(metrics) {
  return Object.keys(metrics)
    .map(function(index) {
      return metrics[index];
    })
    .map(function(fnMeta) {
      var loc = this._getMetricOriginalLocations([fnMeta.loc])[0];

      // Force remove the last skip key
      if (fnMeta.skip === undefined) {
        delete fnMeta.skip;

        if (loc.skip !== undefined) {
          fnMeta.skip = loc.skip;
        }
      }

      return extend({}, fnMeta, {loc: loc});
    }.bind(this))
    .reduce(this._arrayToArrayLikeObject, {});
};

Instrumenter.prototype._branchMapTransformer = function(metrics) {
  return Object.keys(metrics)
    .map(function(index) {
      return metrics[index];
    })
    .map(function(branchMeta) {
      return extend({}, branchMeta, {
        locations: this._getMetricOriginalLocations(branchMeta.locations)
      });
    }.bind(this))
    .reduce(this._arrayToArrayLikeObject, {});
};

Instrumenter.prototype._getMetricOriginalLocations = function(metricLocations) {
  if (!metricLocations) {
    metricLocations = [];
  }

  var o = {
    column: 0,
    line: 0
  };

  return metricLocations
    .map(function(generatedPositions) {
      return [this._getOriginalPositionsFor(generatedPositions), generatedPositions];
    }.bind(this))
    .map(function(info) {
      var originalPositions = info[0];
      var generatedPosition = info[1];
      var start = originalPositions.start;
      var end = originalPositions.end;
      var postitions = [start.line, start.column, end.line, end.column];
      var isValid = postitions.every(function(n) {
        return n !== null;
      });

      // Matches behavior in _fnMapTransformer above.
      if (generatedPosition.skip === undefined) {
        delete generatedPosition.skip;
      }

      if (isValid) {
        return extend({}, generatedPosition, {start: start, end: end})
      }

      return {
        end: o,
        skip: true,
        start: o
      };
    });
};

Instrumenter.prototype._getOriginalPositionsFor = function(generatedPositions) {
  if (!generatedPositions) {
    generatedPositions = {
      end: {},
      start: {}
    };
  }

  function reducer(originalPositions, current) {
    var generatedPosition = current[0];
    var position = current[1];
    var originalPosition = this._babelMap.originalPositionFor(generatedPosition);
    // Remove extra keys
    delete originalPosition.name;
    delete originalPosition.source;
    originalPositions[position] = originalPosition;
    return originalPositions;
  }

  return POSITIONS
    .map(function(position) {
      return [generatedPositions[position], position];
    })
    .reduce(reducer.bind(this), {});
};

Instrumenter.prototype._arrayToArrayLikeObject = function(arrayLikeObject, item, index) {
  arrayLikeObject[index + 1] = item;
  return arrayLikeObject;
};

module.exports = Instrumenter;
