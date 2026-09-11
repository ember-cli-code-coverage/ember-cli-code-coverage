/* eslint-disable no-undef */
'use strict';

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },

  options: {
    babel: {
      plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
    },
  },
};
