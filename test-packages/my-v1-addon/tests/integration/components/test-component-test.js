import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | test-component', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<TestComponent />`);
    assert.dom('.abcd').exists();

    await click('.abcd');
    assert.dom('.efgh').exists();
    await click('.efgh');
  });
});
