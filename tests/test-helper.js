import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import { start } from 'ember-cli-qunit';
import loadEmberExam from 'ember-exam/test-support/load';

loadEmberExam();
setResolver(resolver);
start();
