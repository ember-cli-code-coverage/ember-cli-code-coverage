import Application from 'my-vite-app/app';
import config from 'my-vite-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.done(async function () {
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
