import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import Bar from 'my-vite-app/components/bar';

module('Integration | Component | Bar', function (hooks) {
  setupRenderingTest(hooks);

  test('it clicks button', async function (assert) {
    await render(<template><Bar/></template>);

    await click('button');
    assert.ok(true);
  });
});
