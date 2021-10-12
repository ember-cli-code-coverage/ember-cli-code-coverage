'use strict';

let {
  isRelativeToInRepoAddon,
  filterNonAppOwnedFiles,
  adjustCoverageKey,
  adjustCoverage
} = require('../packages/ember-cli-code-coverage/lib/attach-middleware');
let { Project } = require('fixturify-project');
let path = require('path');

describe('attach-middleware', function() {
  describe('isRelativeToInRepoAddon', function() {
    it('works with in repo addons', function() {
      let inRepoAddons = ['lib/hello', 'lib/foo'];

      const project = new Project('my-app', '1.0.0');
      project.files = {
        lib: {
          hello: {
            app: {
              components: {
                'world.js': 'blank',
              }
            },
            addon: {
              components: {
                'world.js': 'blank',
              }
            }
          },
          foo: {
            app: {
              components: {
                'bar.js': 'blank',
              }
            },
            'addon-test-support': {
              'baz.js': 'blank'
            },
            addon: {
              components: {
                'bar.js': 'blank',
              }
            }
          },
        }
      }
      project.writeSync();

      // classic app in repo addon
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'hello/components/world.js')).toEqual('lib/hello/addon/components/world.js');
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'foo/components/bar.js')).toEqual('lib/foo/addon/components/bar.js');
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'foo/test-support/foo.js')).toEqual('lib/foo/addon-test-support/foo.js');

      // embroider app in repo addon
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'lib/hello/components/world.js')).toEqual('lib/hello/addon/components/world.js');
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'lib/foo/components/bar.js')).toEqual('lib/foo/addon/components/bar.js');
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'lib/foo/test-support/foo.js')).toEqual('lib/foo/addon-test-support/foo.js');

      // in repo app exports as seen from within the app
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'my-app/components/world.js')).toEqual('lib/hello/app/components/world.js');
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'my-app/components/bar.js')).toEqual('lib/foo/app/components/bar.js');

      // in repo app exports as seen from within the dummy app
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'dummy/components/world.js')).toEqual('lib/hello/app/components/world.js');
      expect(isRelativeToInRepoAddon(project.baseDir, inRepoAddons, 'dummy/components/bar.js')).toEqual('lib/foo/app/components/bar.js');
    });
  });

  describe('filterNonAppOwnedFiles', function() {
    it('tests that a relative path must exist within project root', function() {
      const project = new Project('my-project', '1.0.0');
      project.files = {
        foo: {
          bar: {
            'test.js': 'blank'
          }
        }
      };

      project.writeSync();

      expect(filterNonAppOwnedFiles(project.baseDir, 'foo/bar/test.js')).toEqual(true);
      expect(filterNonAppOwnedFiles(project.baseDir, 'foo/bar/does-not-exist.js')).toEqual(false);
    });
  });

  describe('adjustCoverageKey', function() {
    it('works for addons', function() {
      const project = new Project('my-project', '1.0.0');
      project.files = {
        lib: {
          hello: {
            addon: {
              'world.js': 'blank'
            }
          }
        }
      };

      project.pkg['ember-addon'] = {
        paths: ['lib/hello']
      };

      project.writeSync();

      expect(adjustCoverageKey(project.baseDir, path.join(project.baseDir, 'dummy/app.js'), true)).toEqual('app/app.js');
      expect(adjustCoverageKey(project.baseDir, path.join(project.baseDir, 'dummy/services/abc.js'), true)).toEqual('app/services/abc.js');
      expect(adjustCoverageKey(project.baseDir, path.join(project.baseDir, 'ember-test-addon/services/abc.js'), true)).toEqual('addon/services/abc.js');
      expect(adjustCoverageKey(project.baseDir, path.join(project.baseDir, 'hello/components/world.js'), true)).toEqual('lib/hello/addon/components/world.js');
    });

    it('works for classic app', function() {
      const project = new Project('my-project', '1.0.0');
      project.files = {
        lib: {
          hello: {
            addon: {
              'world.js': 'blank'
            }
          }
        }
      };

      project.pkg['ember-addon'] = {
        paths: ['lib/hello']
      };

      project.writeSync();

      expect(adjustCoverageKey(project.baseDir, path.join(project.baseDir, 'ember-test-app/app.js'), false)).toEqual('app/app.js');
      expect(adjustCoverageKey(project.baseDir, path.join(project.baseDir, 'ember-test-app/services/abc.js'), false)).toEqual('app/services/abc.js');
      expect(adjustCoverageKey(project.baseDir, path.join(project.baseDir, 'hello/components/world.js'), false)).toEqual('lib/hello/addon/components/world.js');
    });

    it('works for embroider app', function() {
      expect(adjustCoverageKey('/foo/bar/baz/embroider/fbeb74/', '/foo/bar/baz/embroider/fbeb74/ember-test-app/app.js', false)).toEqual('app/app.js');
      expect(adjustCoverageKey('/foo/bar/baz/embroider/fbeb74/', '/foo/bar/baz/embroider/fbeb74/ember-test-app/services/abc.js', false)).toEqual('app/services/abc.js');
    });
  });

  describe('adjustCoverage', function () {
    function createEngineApp() {
      const project = new Project('my-app', '1.0.0');
      project.files = {
        app: {
          'app.js': 'blank',
          utils: {
            'util-app.js': 'blank'
          }
        },
        lib: {
          'my-in-repo-engine': {
            app: {
              components: {
                'hello.js': 'blank',
              },
              controllers: {
                'world.js': 'blank',
              }
            },
            addon: {
              'engine.js': 'blank',
              'resolver.js': 'blank',
              'routes.js': 'blank',
              utils: {
                'util-engine.js': 'blank',
              },
              components: {
                'hello.js': 'blank',
              },
              controllers: {
                'world.js': 'blank',
              }
            }
          },
        }
      };

      project.pkg.name = 'my-app-with-in-repo-engine';
      project.pkg['ember-addon'] = {
        paths: ['lib/my-in-repo-engine']
      };

      return project;
    }

    it('works with in repo engines in embroider app', function() {
      let project = createEngineApp();
      project.writeSync();

      let coverage = {
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/app.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/_app_/components/hello.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/_app_/controllers/world.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/resolver.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/engine.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/routes.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/utils/util-engine.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/controllers/world.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/lib/my-in-repo-engine/components/hello.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/router.js': { path: '' },
        '/foo/T/embroider/fbeb74/my-app-with-in-repo-engine/utils/util-app.js': { path: '' },
      };

      let options = {
        root: project.baseDir,
        isAddon: false
      };

      let adjustedCoverage = adjustCoverage(coverage, options);

      expect(Object.keys(adjustedCoverage)).toEqual([
        'app/app.js',
        'lib/my-in-repo-engine/app/components/hello.js',
        'lib/my-in-repo-engine/app/controllers/world.js',
        'lib/my-in-repo-engine/addon/resolver.js',
        'lib/my-in-repo-engine/addon/engine.js',
        'lib/my-in-repo-engine/addon/routes.js',
        'lib/my-in-repo-engine/addon/utils/util-engine.js',
        'lib/my-in-repo-engine/addon/controllers/world.js',
        'lib/my-in-repo-engine/addon/components/hello.js',
        'app/router.js',
        'app/utils/util-app.js',
      ]);
    });

    it('works with in repo engines in classic app', function() {
      let project = createEngineApp();
      project.writeSync();

      let coverage = {
        [`${project.baseDir}/my-app-with-in-repo-engine/app.js`]: { path: '' },
        [`${project.baseDir}/my-app-with-in-repo-engine/components/hello.js`]: { path: '' },
        [`${project.baseDir}/my-app-with-in-repo-engine/controllers/world.js`]: { path: '' },
        [`${project.baseDir}/my-in-repo-engine/resolver.js`]: { path: '' },
        [`${project.baseDir}/my-in-repo-engine/engine.js`]: { path: '' },
        [`${project.baseDir}/my-in-repo-engine/routes.js`]: { path: '' },
        [`${project.baseDir}/my-in-repo-engine/utils/util-engine.js`]: { path: '' },
        [`${project.baseDir}/my-in-repo-engine/controllers/world.js`]: { path: '' },
        [`${project.baseDir}/my-in-repo-engine/components/hello.js`]: { path: '' },
        [`${project.baseDir}/my-app-with-in-repo-engine/router.js`]: { path: '' },
        [`${project.baseDir}/my-app-with-in-repo-engine/utils/util-app.js`]: { path: '' },
      };

      let options = {
        root: project.baseDir,
        isAddon: false
      };

      let adjustedCoverage = adjustCoverage(coverage, options);

      expect(Object.keys(adjustedCoverage)).toEqual([
        'app/app.js',
        'lib/my-in-repo-engine/app/components/hello.js',
        'lib/my-in-repo-engine/app/controllers/world.js',
        'lib/my-in-repo-engine/addon/resolver.js',
        'lib/my-in-repo-engine/addon/engine.js',
        'lib/my-in-repo-engine/addon/routes.js',
        'lib/my-in-repo-engine/addon/utils/util-engine.js',
        'lib/my-in-repo-engine/addon/controllers/world.js',
        'lib/my-in-repo-engine/addon/components/hello.js',
        'app/router.js',
        'app/utils/util-app.js',
      ]);
    });
  });
});
