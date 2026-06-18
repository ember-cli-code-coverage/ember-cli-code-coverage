import { module, test } from 'qunit';
import { greet, isActive } from '#src/utils';

module('Unit | Utils', function () {
  test('greet returns greeting with name', function (assert) {
    assert.strictEqual(greet('World'), 'Hello, World!');
    assert.strictEqual(greet('Ember'), 'Hello, Ember!');
  });

  test('greet returns default greeting without name', function (assert) {
    assert.strictEqual(greet(), 'Hello, World!');
    assert.strictEqual(greet(null), 'Hello, World!');
  });

  test('isActive returns true for positive values', function (assert) {
    assert.true(isActive(1));
    assert.true(isActive(100));
  });

  test('isActive returns false for zero or negative values', function (assert) {
    assert.false(isActive(0));
    assert.false(isActive(-1));
  });
});
