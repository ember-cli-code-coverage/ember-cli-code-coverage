import EmberRouter from '@ember/routing/router';
import config from 'my-embroider-app-template-imports/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {});
