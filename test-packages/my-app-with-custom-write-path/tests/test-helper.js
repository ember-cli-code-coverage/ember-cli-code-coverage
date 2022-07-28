import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

QUnit.done(async function() {
  forceModulesToBeLoaded();
  await sendCoverage(undefined, '/custom/test-write-path');
});

setApplication(Application.create(config.APP));

start();
