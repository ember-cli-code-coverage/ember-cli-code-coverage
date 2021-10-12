import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import { forceModulesToBeLoaded } from 'ember-cli-code-coverage/test-support';

forceModulesToBeLoaded();

setApplication(Application.create(config.APP));

start();
