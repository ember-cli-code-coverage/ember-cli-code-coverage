import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import { setTesting } from '@embroider/macros';
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

class TestApp extends EmberApp {
  modules = {
    './router': Router,
    // add any custom services here
    // import.meta.glob('./services/*', { eager: true }),
  };
}

Router.map(function () {});

export function start() {
  setTesting(true);
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: '#ember-testing',
    }),
  );

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.done(async function() {
    // forceModulesToBeLoaded() uses requirejs which doesn't exist in Vite builds
    // For Vite, modules are already loaded via ESM imports
    try {
      forceModulesToBeLoaded();
    } catch (_e) {
      // Ignore - requirejs not available in Vite
    }
    await sendCoverage();
  });

  qunitStart();
}