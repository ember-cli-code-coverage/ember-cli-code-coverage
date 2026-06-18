import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import Foo from '#src/components/foo';

module('Integration | Component | Foo', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a button', async function (assert) {
    await render(<template><Foo /></template>);

    assert.dom('button').exists();
    assert.dom('button').hasText('increment');
  });

  test('clicking the button increments the counter', async function (assert) {
    await render(<template><Foo /></template>);

    await click('button');

    assert.dom('button').exists();
  });
});
