import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'my-embroider-app/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
