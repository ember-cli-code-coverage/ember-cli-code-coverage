import Component from '@ember/component';
import layout from '../templates/components/test-component';

export default Component.extend({
    layout,
    init() {
        this._super(...arguments);
        this.data = [1, 2, 3];
        this.a = false;
    },

    someAction() {
        this.set('a', this.data ? false: true);
        this.set('data', null);
    }
});