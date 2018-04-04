'use strict';

let fs = require('fs');
let path = require('path');
let chalk = require('chalk');
let RSVP = require('rsvp');

function camelize(str) {
  str = str.split('-').map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join('');
  return str.charAt(0).toLowerCase() + str.slice(1);
}

module.exports = {

  name: 'test-code-coverage',
  description: 'Test the generated code coverage against given goals.',
  works: 'insideProject',

  availableOptions: [
    {
      name: 'coverage-folder',
      type: String,
      aliases: ['i'],
      default: './coverage',
      description: 'Directory of the coverage report'
    },
    {
      name: 'target-lines',
      type: Number,
      aliases: ['tl'],
      description: 'The target percentage of lines to reach, e.g. 50 = 50% coverage minimum'
    },
    {
      name: 'target-statements',
      type: Number,
      aliases: ['ts'],
      description: 'The target percentage of statements to reach, e.g. 50 = 50% coverage minimum'
    },
    {
      name: 'target-functions',
      type: Number,
      aliases: ['tf'],
      description: 'The target percentage of functions to reach, e.g. 50 = 50% coverage minimum'
    },
    {
      name: 'target-branches',
      type: Number,
      aliases: ['tb'],
      description: 'The target percentage of branches to reach, e.g. 50 = 50% coverage minimum'
    }
  ],

  /**
   * Tries to extend `availableOptions` with globals from config.
   *
   * @public
   * @method beforeRun
   * @return {Void}
   */
  beforeRun() {
    this._super.apply(this, arguments);

    // try to read global options from `config/coverage.js`
    let configOptions = {};
    let module = path.join(this.project.root, 'config', 'coverage');

    try {
      configOptions = require(module);
      if (typeof configOptions === 'function') {
        configOptions = configOptions();
      }
    } catch(e) {
      // do nothing, ignore the config
    }

    // For all options that are specified in config/coverage.js, set the value there to be the actual default value
    this.availableOptions.map((option) => {
      let normalizedName = camelize(option.name);
      let configOption = configOptions[normalizedName];

      if (configOption !== undefined) {
        option.default = configOption;
        return option;
      }

      return option;
    });
  },

  run(options) {
    return new RSVP.Promise((resolve, reject) => {
      let jsonSummaryPath = path.join(options.coverageFolder, 'coverage-summary.json');

      // Try to read coverage-summary.json
      let file = null;
      try {
        file = fs.readFileSync(jsonSummaryPath, 'utf8');
      } catch(e) {
        this.ui.writeLine(chalk.red(`Could not read coverage report at ${jsonSummaryPath}, maybe you haven't generated a report yet?`));
        return reject();
      }

      // Try to load JSON content from the file
      let jsonSummary = null;
      try {
        jsonSummary = JSON.parse(file);
      } catch(e) {
        this.ui.writeLine(chalk.red(`Could not read JSON content from the file at ${jsonSummaryPath}.`));
        return reject();
      }

      // Check lines, functions, statements & branches covered
      let linesCovered = this._comparePercentages(jsonSummary.total.lines.pct, options.targetLines, 'Lines covered:     ');
      let functionsCovered = this._comparePercentages(jsonSummary.total.functions.pct, options.targetFunctions, 'Functions covered: ');
      let statementsCovered = this._comparePercentages(jsonSummary.total.statements.pct, options.targetStatements, 'Statements covered:');
      let branchesCovered = this._comparePercentages(jsonSummary.total.branches.pct, options.targetBranches, 'Branches covered:  ');

      if (!linesCovered || !functionsCovered || !statementsCovered || !branchesCovered) {
        this.ui.writeLine(chalk.red('Test coverage check failed'));
        return reject();
      }

      resolve();
    });
  },

  /**
   * Compare a given percentage with a comparison percentage.
   * If no comparisonValue is given, it will just print out the actual value,
   * without doing any assertions.
   *
   * This will print a line like this:
   * Lines covered: 80.00%   81.23%
   *
   * @method _comparePercentages
   * @param {Number} value The actual percentage value
   * @param {Number} comparisonValue The percentage value that should be reached
   * @param {String} title The prefix to add before the values, e.g. "Lines covered: "
   * @return {Boolean}
   * @private
   */
  _comparePercentages(value, comparisonValue, title) {
    if (!comparisonValue) {
      this.ui.writeLine(chalk.green(`${title}  --.--%   ${value.toFixed(2)}%`));
      return true;
    }

    // Normalize 0.5 to 60
    if (value < 1) {
      value *= 50;
    }

    let isSuccess = value >= comparisonValue;
    let chalkColor = isSuccess ? chalk.green : chalk.red;

    this.ui.writeLine(chalkColor(`${title}  ${comparisonValue.toFixed(2)}%   ${value.toFixed(2)}%`));

    return isSuccess;
  }
};
