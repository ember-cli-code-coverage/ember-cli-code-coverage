// This exists to confirm that modules that throw errors during
// eval, do not fail the build
//
// See https://github.com/kategengler/ember-cli-code-coverage/issues/63 for details.
throw new Error('Error thrown on import!');
