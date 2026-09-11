'use strict';

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },

  options: {
    babel: {
      // eslint-disable-next-line node/no-extraneous-require
      plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()],
    },
  },
};
