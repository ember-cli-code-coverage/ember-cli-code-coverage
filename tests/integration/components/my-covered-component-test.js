import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('my-covered-component', 'Integration | Component | my covered component', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{my-covered-component}}`);

  assert.equal(this.$().text().trim(), 'foo');
});
