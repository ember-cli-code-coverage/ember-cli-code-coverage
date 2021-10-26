/* eslint-env node */
'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'my-in-repo-engine',

  lazyLoading: {
    enabled: false
  },

  isDevelopingAddon() {
    return true;
  },

  included() {
    this._super.included.apply(this, arguments);

    this.options.babel.plugins.push(
      ...require('ember-cli-code-coverage').buildBabelPlugin()
    );
  },
});
