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
});
