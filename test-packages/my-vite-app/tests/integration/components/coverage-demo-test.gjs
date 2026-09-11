import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import CoverageDemo from 'my-vite-app/components/coverage-demo';

module('Integration | Component | CoverageDemo', function (hooks) {
  setupRenderingTest(hooks);

  // Only the truthy paths are exercised, so branch coverage should show
  // the falsy path of each conditional as uncovered.
  test('renders the truthy branches', async function (assert) {
    const items = ['a', 'b'];

    await render(
      <template><CoverageDemo @flag={{true}} @items={{items}} /></template>,
    );

    assert.dom('.block').hasText('block-then');
    assert.dom('.no-else').hasText('then-only');
    assert.dom('.inline').hasText('inline-then');
    assert.dom('.unless').hasText('');
    assert.dom('.list').hasText('a b');
  });
});
