// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { action } from '@ember/object';

// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  init() {
    this._super(...arguments);
    this.data = [1, 2, 3];
    this.a = false;
  },

  someAction: action(function () {
    this.set('a', this.data ? false : true);
    this.set('data', null);
  }),
});
