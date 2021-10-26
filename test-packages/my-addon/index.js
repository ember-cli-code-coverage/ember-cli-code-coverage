'use strict';

module.exports = {
  name: require('./package').name,

  options: {
    babel: {
      plugins: [
        ...require('ember-cli-code-coverage').buildBabelPlugin(),
      ],
    },
  }
};
