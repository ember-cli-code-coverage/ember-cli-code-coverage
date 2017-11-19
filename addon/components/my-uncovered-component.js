import Ember from 'ember';
import layout from '../templates/components/my-uncovered-component';

export default Ember.Component.extend({
  layout,
  foo: Ember.computed(function() {
    return 'foo';
  })
});
