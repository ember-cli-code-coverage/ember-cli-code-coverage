/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'my-in-repo-engine',
    environment
  };

  return ENV;
};
