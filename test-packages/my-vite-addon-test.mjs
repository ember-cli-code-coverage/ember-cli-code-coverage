'use strict';

import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { exists, readFile } from 'fs-extra';
import { Project } from 'fixturify-project';

const APP_DIR = 'my-vite-addon';

async function setupViteTestDir(env) {
  const project = Project.fromDir(`test-packages/${APP_DIR}`, {
    linkDevDeps: true,
  });

  project.addDevDependency(
    'ember-cli-code-coverage',
    `file:${process.cwd()}/packages/ember-cli-code-coverage`
  );

  await project.write();

  await execa('pnpm', ['install', '--no-frozen-lockfile'], {
    cwd: project.baseDir,
    env,
  });

  return project.baseDir;
}

describe('vite addon coverage generation', function () {
  it('instruments code when COVERAGE=true during vite build', async function () {
    const env = { COVERAGE: 'true' };
    const buildPath = await setupViteTestDir(env);

    await execa('pnpm', ['vite', 'build', '--mode', 'development', '--out-dir', 'dist-tests'], {
      cwd: buildPath,
      env,
    });

    const testsIndexExists = await exists(`${buildPath}/dist-tests/tests/index.html`);
    expect(testsIndexExists).toBe(true);

    const utilsFile = await readFile(`${buildPath}/dist-tests/src/utils.js`, 'utf-8');
    expect(utilsFile).toContain('__coverage__');
  });

  it('does NOT instrument code when COVERAGE is not set', async function () {
    const env = { COVERAGE: 'false' };
    const buildPath = await setupViteTestDir(env);

    await execa('pnpm', ['vite', 'build', '--mode', 'development', '--out-dir', 'dist-tests'], {
      cwd: buildPath,
      env,
    });

    const testsIndexExists = await exists(`${buildPath}/dist-tests/tests/index.html`);
    expect(testsIndexExists).toBe(true);

    const utilsFile = await readFile(`${buildPath}/dist-tests/src/utils.js`, 'utf-8');
    expect(utilsFile).not.toContain('__coverage__');
  });
});
