import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | FooBar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and increments', async function (assert) {
    await render(hbs`<FooBar />`);

    assert.dom('button').hasText('Count: 0');

    await click('button');

    assert.dom('button').hasText('Count: 1');
  });
});
