import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | my-service', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const service = this.owner.lookup('service:my-service');
    assert.ok(service);
  });

  test('testFunc() returns expected value', function(assert) {
    const service = this.owner.lookup('service:my-service');
    assert.equal(service.testFunc(), true, 'Expected `testFunc()` to be overwritten by app to return `true`');
  });
});
