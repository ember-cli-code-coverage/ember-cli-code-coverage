import { readJSON } from 'fs-extra';
import { expect } from 'vitest';
import { Project } from 'fixturify-project';
import { exists } from 'fs-extra';
import { readFile } from 'fs/promises';
import { execa } from 'execa';

export default async function setupTestDir(APP_DIR, env, deps) {
  const project = Project.fromDir(`test-packages/${APP_DIR}`, { linkDevDeps: true });

  for (const [key,value] of Object.entries(deps)) {
    project.addDevDependency(key, value);
  }

  if (depsReinstallNeeded(deps)) {
    project.addDevDependency(
      `ember-cli-code-coverage`,
      `file:${process.cwd()}/packages/ember-cli-code-coverage`
    );
  }

  await project.write();

  if (deps && Object.keys(deps).length > 0) {
    await execa('pnpm', ['install', '--no-frozen-lockfile'], { cwd: project.baseDir, env });
  }

  return project.baseDir;
}

export async function setupV2AddonTestDirs(DIR, env) {
  const testProject = Project.fromDir(`test-packages/${DIR}/test-app`, { linkDevDeps: true });
  const addonProject = Project.fromDir(`test-packages/${DIR}/addon`, { linkDevDeps: true });

  addonProject.addDevDependency(
    `ember-cli-code-coverage`,
    `file:${process.cwd()}/packages/ember-cli-code-coverage`
  );

  await addonProject.write();

  await execa('pnpm', ['install', '--no-frozen-lockfile'], { cwd: addonProject.baseDir, env });
  // build v2 addon with instrumentation
  await execa('npm', ['run', 'build'], { cwd: addonProject.baseDir, env });

  testProject.addDevDependency(
    `ember-cli-code-coverage`,
    `file:${process.cwd()}/packages/ember-cli-code-coverage`
  );
  testProject.addDevDependency(`my-v2-addon-gjs-gts`, `file:${addonProject.baseDir}`);

  await testProject.write();

  await execa('pnpm', ['install', '--no-frozen-lockfile'], { cwd: testProject.baseDir, env });

  return { testAppDir: testProject.baseDir, addonDir: addonProject.baseDir };
}

function depsReinstallNeeded(deps) {
  return deps && Object.keys(deps).length > 0;
}

export async function assertCoverageExists(buildPath, { isV2Addon } = { isV2Addon: false }) {
  await assertFileIsNotEmpty(`${buildPath}/lcov-report/index.html`);
  await assertFileIsNotEmpty(`${buildPath}/index.html`);
  let summary = await readJSON(`${buildPath}/coverage-summary.json`);

  expect(summary).toMatchSnapshot();
}


export async function assertFileExists(path) {
  if (!await exists(path)) {
    throw new Error(`File ${path} does not exist`);
  }
}

export async function assertDirDoesNotExists(dir) {
  if (await exists(dir)) {
    throw new Error(`Dir ${dir} exists`);
  }
}

export async function assertFileIsNotEmpty(path) {
  return  (await readFile(path, 'utf8').length) > 0;
}