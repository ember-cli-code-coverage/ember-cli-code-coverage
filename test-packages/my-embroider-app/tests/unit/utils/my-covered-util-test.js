import myCoveredUtil from 'my-embroider-app/utils/my-covered-util';
import { module, test } from 'qunit';

module('Unit | Utility | my covered util');

test('it works', function (assert) {
  let result = myCoveredUtil();
  assert.ok(result);
});
