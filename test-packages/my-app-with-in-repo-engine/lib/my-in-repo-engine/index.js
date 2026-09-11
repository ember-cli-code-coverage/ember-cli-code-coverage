/* eslint-env node */
'use strict';

// eslint-disable-next-line node/no-extraneous-require
const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'my-in-repo-engine',

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  lazyLoading: {
    enabled: false,
  },

  isDevelopingAddon() {
    return true;
  },

  included() {
    this._super.included.apply(this, arguments);

    this.options.babel.plugins.push(
      // eslint-disable-next-line node/no-extraneous-require
      ...require('ember-cli-code-coverage').buildBabelPlugin()
    );
  },
});
