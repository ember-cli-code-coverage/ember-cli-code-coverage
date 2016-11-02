/* global define */
import { module, test } from 'qunit';


module('invalid modules');

test('noop to setup module for exit handler', function(assert) {
  assert.expect(0);

  define('ember-cli-code-coverage/fake-module-from-unit-test', [], function() {
    // This exists to confirm that modules that throw errors during
    // eval, do not fail the build
    //
    // See https://github.com/kategengler/ember-cli-code-coverage/issues/63 for details.
    throw new Error('Error thrown on import!');
  });
});
