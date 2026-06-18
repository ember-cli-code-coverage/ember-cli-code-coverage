'use strict';

import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'fs/promises';
import { Project } from 'fixturify-project';
import { assertCoverageExists, assertDirDoesNotExists } from './utils.mjs';

const APP_DIR = 'my-vite-app';

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

/**
 * Scan all JS chunks emitted by `vite build` and return true if any of them
 * contain the Istanbul `__coverage__` marker.
 */
async function distContainsCoverageMarker(buildPath) {
  const assetsDir = `${buildPath}/dist/assets`;
  const files = await readdir(assetsDir);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const contents = await readFile(`${assetsDir}/${file}`, 'utf-8');
    if (contents.includes('__coverage__')) {
      return true;
    }
  }
  return false;
}

describe('vite app coverage generation', function () {
  it('instruments code and generates coverage when COVERAGE=true', async function () {
    const env = { COVERAGE: 'true' };
    const buildPath = await setupViteTestDir(env);

    await execa('pnpm', ['vite', 'build', '--mode', 'development'], {
      cwd: buildPath,
      env,
    });

    expect(await distContainsCoverageMarker(buildPath)).toBe(true);

    await execa('npx', ['ember', 'test', '--path=dist', '--test-port=0'], {
      cwd: buildPath,
      env,
    });

    await assertCoverageExists(`${buildPath}/coverage`);
  });

  it('does NOT instrument code or generate coverage when COVERAGE is not set', async function () {
    const env = { COVERAGE: 'false' };
    const buildPath = await setupViteTestDir(env);

    await execa('pnpm', ['vite', 'build', '--mode', 'development'], {
      cwd: buildPath,
      env,
    });

    expect(await distContainsCoverageMarker(buildPath)).toBe(false);

    await execa('npx', ['ember', 'test', '--path=dist', '--test-port=0'], {
      cwd: buildPath,
      env,
    });

    await assertDirDoesNotExists(`${buildPath}/coverage`);
  });
});
