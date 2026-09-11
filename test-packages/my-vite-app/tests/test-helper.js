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
    // Under Vite there is no module registry to walk, so this is a no-op.
    // Files no test imported come from the build-time baseline instead.
    forceModulesToBeLoaded();
    await sendCoverage();
  });

  qunitStart();
}
