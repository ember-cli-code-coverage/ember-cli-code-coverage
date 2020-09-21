'use strict';

const path = require('path');
const fs = require('fs-extra');
const fixturify = require('fixturify');

class InRepoAddon {
  static async generate(app, name) {
    let args = ['generate', 'in-repo-addon', name];
    await app.runEmberCommand.apply(app, args);

    let addon = new InRepoAddon(app, name);

    // Move generated addon stubs from /lib to /local-lib
    await fs.move(
      path.join(app.path, 'lib', name, 'package.json'),
      path.join(addon.path, 'package.json')
    );

    await fs.move(path.join(app.path, 'lib', name, 'index.js'), path.join(addon.path, 'index.js'));

    app.editPackageJSON(pkg => {
      pkg['ember-addon'].paths = [path.join('local-lib', 'addons', addon.name)];
    });

    addon.editPackageJSON(pkg => (pkg.dependencies = { 'ember-cli-htmlbars': '*' }));

    return addon;
  }

  constructor(app, name) {
    this.name = name;
    this.app = app;
    this.path = path.join(app.path, 'local-lib', 'addons', name);
  }

  editPackageJSON(editor) {
    let packageJSONPath = path.join(this.path, 'package.json');
    let pkg = fs.readJsonSync(packageJSONPath);
    editor(pkg);
    fs.writeJsonSync(packageJSONPath, pkg);
  }

  writeFixture(fixture) {
    fixturify.writeSync(this.path, fixture);
  }

  nest(addon) {
    this.editPackageJSON(pkg => {
      pkg['ember-addon'] = pkg['ember-addon'] || {};
      pkg['ember-addon'].paths = pkg['ember-addon'].paths || [];
      pkg['ember-addon'].paths.push(`../${addon.name}`);
    });
  }

  async generateNestedAddon(name) {
    // Generate another in-repo-addon at the app level...
    let args = Array.prototype.slice.call(arguments);
    args.unshift(this.app);
    let addon = await InRepoAddon.generate.apply(null, args);

    // Remove the in-repo-addon from the app...
    this.app.editPackageJSON(pkg => {
      pkg['ember-addon'].paths = pkg['ember-addon'].paths.filter(path => path !== `lib/${name}`);
    });

    // Add the in-repo-addon to this engine.
    this.editPackageJSON(pkg => {
      pkg['ember-addon'] = pkg['ember-addon'] || {};
      pkg['ember-addon'].paths = pkg['ember-addon'].paths || [];
      pkg['ember-addon'].paths.push(`../${name}`);
    });

    return addon;
  }
}

module.exports = InRepoAddon;
