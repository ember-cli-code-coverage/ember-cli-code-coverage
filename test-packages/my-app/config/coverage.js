/* eslint-env node */

module.exports = {
  excludes: ['**/utils/my-uncovered-util.js'],
  reporters: ['lcov', 'html', 'text', 'json-summary'],
};
