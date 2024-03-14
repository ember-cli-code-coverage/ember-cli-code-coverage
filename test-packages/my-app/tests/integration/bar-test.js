import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Bar', function (hooks) {
  setupRenderingTest(hooks);

  test('it clicks button', async function (assert) {
    await render(hbs`<Bar/>`);

    await click('button');
    assert.ok(true);
  });
});
