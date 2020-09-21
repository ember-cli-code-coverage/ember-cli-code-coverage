import myCoveredUtil from 'my-app-with-custom-path-in-repo-addon/utils/my-covered-util-app';
import { module, test } from 'qunit';

module('Unit | Utility | my covered util app');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = myCoveredUtil();
  assert.ok(result);
});
