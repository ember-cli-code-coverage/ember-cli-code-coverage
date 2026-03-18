'use strict';

import { normalizeRelativePath, adjustCoverageKey } from '../packages/ember-cli-code-coverage/lib/attach-middleware';
import { Project } from 'fixturify-project';
import { join } from 'path';
import { expect, describe, it } from 'vitest';

describe('attach-middleware', () => {
  it('normalizeRelativePath correctly normalizes paths from embroider', async () => {
    let project = new Project('my-app', '1.0.0');
    project.pkg['ember-addon'] = {
      paths: ['lib/hello']
    };
    await project.write();

    let embroiderTmp = '/foo/embroider/fbeb74';

    expect(normalizeRelativePath(project.baseDir, `${embroiderTmp}/app-namespace/lib/hello/components/world.js`))
      .toEqual('hello/components/world.js');

    expect(normalizeRelativePath(project.baseDir, `${embroiderTmp}/app-namespace/lib/hello/test-support/world.js`))
      .toEqual('hello/test-support/world.js');

    expect(normalizeRelativePath(project.baseDir, `${embroiderTmp}/app-namespace/components/world.js`))
      .toEqual('app-namespace/components/world.js');

    expect(normalizeRelativePath(project.baseDir, `${embroiderTmp}/lib/hello/test-support/world.js`))
      .toEqual('hello/test-support/world.js');

    expect(normalizeRelativePath(project.baseDir, `${embroiderTmp}/components/world.js`))
      .toEqual('components/world.js');
  });

  it('adjustCoverageKey works for a classic app', () => {
    let root = '/root/';
    let namespaceMappings = new Map([
      ['app-namespace', 'app'],
      ['hello', 'lib/hello/addon'],
      ['hello/test-support', 'lib/hello/addon-test-support'],
    ]);

    expect(adjustCoverageKey(root, join(root, 'app-namespace/app.js'), namespaceMappings))
      .toEqual('app/app.js');

    expect(adjustCoverageKey(root, join(root, 'app-namespace/components/foo.js'), namespaceMappings))
      .toEqual('app/components/foo.js');

    expect(adjustCoverageKey(root, join(root, 'hello/components/foo.js'), namespaceMappings))
      .toEqual('lib/hello/addon/components/foo.js');

    expect(adjustCoverageKey(root, join(root, 'hello/test-support/foo.js'), namespaceMappings))
      .toEqual('lib/hello/addon-test-support/foo.js');
  });

  it('adjustCoverageKey works for an addon', () => {
    let root = '/root/';
    let namespaceMappings = new Map([
      ['addon-namespace', 'addon'],
      ['addon-namespace/test-support', 'addon-test-support'],
      ['hello', 'lib/hello/addon'],
      ['hello/test-support', 'lib/hello/addon-test-support'],
    ]);

    expect(adjustCoverageKey(root, join(root, 'addon-namespace/components/foo.js'), namespaceMappings))
      .toEqual('addon/components/foo.js');

    expect(adjustCoverageKey(root, join(root, 'addon-namespace/test-support/foo.js'), namespaceMappings))
      .toEqual('addon-test-support/foo.js');

    expect(adjustCoverageKey(root, join(root, 'hello/components/foo.js'), namespaceMappings))
      .toEqual('lib/hello/addon/components/foo.js');

    expect(adjustCoverageKey(root, join(root, 'hello/test-support/foo.js'), namespaceMappings))
      .toEqual('lib/hello/addon-test-support/foo.js');
  });

  it('adjustCoverageKey works for a scoped addon', () => {
    let root = '/root/';
    let namespaceMappings = new Map([
      ['@foo/bar', 'addon'],
      ['@foo/bar/test-support', 'addon-test-support'],
    ]);

    expect(adjustCoverageKey(root, join(root, '@foo/bar/components/foo.js'), namespaceMappings))
      .toEqual('addon/components/foo.js');

    expect(adjustCoverageKey(root, join(root, '@foo/bar/test-support/foo.js'), namespaceMappings))
      .toEqual('addon-test-support/foo.js');
  });

  it('adjustCoverageKey resolves module names from template coverage via namespace mappings', async () => {
    // Template coverage entries use module names (e.g., "my-app/templates/application")
    // as keys, not filesystem paths. The middleware must resolve these to actual files.
    let project = new Project('my-app', '1.0.0');
    project.files['app'] = {
      templates: {
        'application.hbs': '{{outlet}}',
      },
      components: {
        'foo.hbs': '<div>foo</div>',
      },
    };
    await project.write();

    let root = project.baseDir;
    let namespaceMappings = new Map([
      ['my-app', join(root, 'app')],
    ]);

    // Module name "my-app/templates/application" should resolve to the .hbs file
    let result = adjustCoverageKey(
      root,
      'my-app/templates/application',
      namespaceMappings
    );
    expect(result).toEqual(join(root, 'app', 'templates', 'application.hbs'));

    // Module name "my-app/components/foo" should resolve to the .hbs file
    result = adjustCoverageKey(
      root,
      'my-app/components/foo',
      namespaceMappings
    );
    expect(result).toEqual(join(root, 'app', 'components', 'foo.hbs'));
  });

  it('adjustCoverageKey resolves scoped module names from template coverage', async () => {
    let project = new Project('@scope/my-addon', '1.0.0');
    project.files['addon'] = {
      templates: {
        'main.hbs': '{{yield}}',
      },
    };
    await project.write();

    let root = project.baseDir;
    let namespaceMappings = new Map([
      ['@scope/my-addon', join(root, 'addon')],
    ]);

    let result = adjustCoverageKey(
      root,
      '@scope/my-addon/templates/main',
      namespaceMappings
    );
    expect(result).toEqual(join(root, 'addon', 'templates', 'main.hbs'));
  });

  it('adjustCoverageKey falls back for unresolvable module names', () => {
    let root = '/root/';
    let namespaceMappings = new Map([
      ['my-app', '/root/app'],
    ]);

    // Module name with unknown namespace returns as-is (monorepo fallback)
    let result = adjustCoverageKey(
      root,
      'unknown-addon/templates/foo',
      namespaceMappings
    );
    expect(result).toEqual('unknown-addon/templates/foo');
  });
});
