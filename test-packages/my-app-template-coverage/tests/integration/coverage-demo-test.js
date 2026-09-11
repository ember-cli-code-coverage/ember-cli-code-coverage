import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | coverage-demo', function (hooks) {
  setupRenderingTest(hooks);

  // Only the truthy paths are exercised, so the report should show the
  // falsy paths of each conditional as uncovered.
  test('renders the truthy branches', async function (assert) {
    this.set('items', ['a', 'b']);

    await render(hbs`<CoverageDemo @flag={{true}} @items={{this.items}} />`);

    assert.dom('.block').hasText('block-then');
    assert.dom('.no-else').hasText('then-only');
    assert.dom('.inline').hasText('inline-then');
    assert.dom('.unless').hasText('');
    assert.dom('.list').hasText('a b');
  });
});
