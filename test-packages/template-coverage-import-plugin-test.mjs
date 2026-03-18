import { describe, it, expect } from 'vitest';
import babel from '@babel/core';
import templateCoverageImportPlugin from '../packages/ember-cli-code-coverage/lib/template-coverage-import-plugin.js';

function transformCode(code, filename = 'test.gjs') {
  const result = babel.transformSync(code, {
    filename,
    plugins: [templateCoverageImportPlugin],
  });
  return result.code;
}

describe('template-coverage-import-plugin', function () {
  it('adds all 3 coverage helper imports to .gjs files with template import', function () {
    const input = [
      'import { template } from "@ember/template-compiler";',
      'const Foo = template("hello", { eval() { return eval(arguments[0]); } });',
    ].join('\n');

    const result = transformCode(input, 'test.gjs');

    expect(result).toContain(
      'import coverageInit from "ember-cli-code-coverage/helpers/coverage-init"'
    );
    expect(result).toContain(
      'import coverageMark from "ember-cli-code-coverage/helpers/coverage-mark"'
    );
    expect(result).toContain(
      'import coverageCond from "ember-cli-code-coverage/helpers/coverage-cond"'
    );
  });

  it('adds all 3 coverage helper imports to .gts files', function () {
    const input = [
      'import { template } from "@ember/template-compiler";',
      'const Foo = template("hello", { eval() { return eval(arguments[0]); } });',
    ].join('\n');

    const result = transformCode(input, 'test.gts');

    expect(result).toContain(
      'import coverageInit from "ember-cli-code-coverage/helpers/coverage-init"'
    );
    expect(result).toContain(
      'import coverageMark from "ember-cli-code-coverage/helpers/coverage-mark"'
    );
    expect(result).toContain(
      'import coverageCond from "ember-cli-code-coverage/helpers/coverage-cond"'
    );
  });

  it('does not add imports to files without template import', function () {
    const input = [
      'import something from "somewhere";',
      'const x = something();',
    ].join('\n');

    const result = transformCode(input, 'test.js');

    expect(result).not.toContain('coverage-init');
    expect(result).not.toContain('coverage-mark');
    expect(result).not.toContain('coverage-cond');
  });

  it('adds coverage helper imports to .ts files with template import', function () {
    const input = [
      'import { template } from "@ember/template-compiler";',
      'const Foo = template("hello", { eval() { return eval(arguments[0]); } });',
    ].join('\n');

    const result = transformCode(input, 'test.ts');

    expect(result).toContain(
      'import coverageInit from "ember-cli-code-coverage/helpers/coverage-init"'
    );
    expect(result).toContain(
      'import coverageMark from "ember-cli-code-coverage/helpers/coverage-mark"'
    );
    expect(result).toContain(
      'import coverageCond from "ember-cli-code-coverage/helpers/coverage-cond"'
    );
  });

  it('adds coverage helper imports to .js files with template import', function () {
    const input = [
      'import { template } from "@ember/template-compiler";',
      'const Foo = template("hello", { eval() { return eval(arguments[0]); } });',
    ].join('\n');

    const result = transformCode(input, 'test.js');

    expect(result).toContain(
      'import coverageInit from "ember-cli-code-coverage/helpers/coverage-init"'
    );
  });

  it('does not add imports to .gjs files without template import', function () {
    const input = [
      'import { on } from "@ember/modifier";',
      'export default function foo() {}',
    ].join('\n');

    const result = transformCode(input, 'test.gjs');

    expect(result).not.toContain('coverage-init');
    expect(result).not.toContain('coverage-mark');
    expect(result).not.toContain('coverage-cond');
  });

  it('does not duplicate imports if already present', function () {
    const input = [
      'import { template } from "@ember/template-compiler";',
      'import coverageInit from "ember-cli-code-coverage/helpers/coverage-init";',
      'import coverageMark from "ember-cli-code-coverage/helpers/coverage-mark";',
      'import coverageCond from "ember-cli-code-coverage/helpers/coverage-cond";',
      'const Foo = template("hello", { eval() { return eval(arguments[0]); } });',
    ].join('\n');

    const result = transformCode(input, 'test.gjs');

    // Count occurrences - should only have one of each
    const initCount = (
      result.match(/ember-cli-code-coverage\/helpers\/coverage-init/g) || []
    ).length;
    const markCount = (
      result.match(/ember-cli-code-coverage\/helpers\/coverage-mark/g) || []
    ).length;
    const condCount = (
      result.match(/ember-cli-code-coverage\/helpers\/coverage-cond/g) || []
    ).length;

    expect(initCount).toBe(1);
    expect(markCount).toBe(1);
    expect(condCount).toBe(1);
  });

  it('inserts imports after existing imports', function () {
    const input = [
      'import { template } from "@ember/template-compiler";',
      'import { on } from "@ember/modifier";',
      'const Foo = template("hello", { eval() { return eval(arguments[0]); } });',
    ].join('\n');

    const result = transformCode(input, 'test.gjs');

    // The coverage imports should appear after the existing imports
    const templateImportIdx = result.indexOf('@ember/template-compiler');
    const modifierImportIdx = result.indexOf('@ember/modifier');
    const coverageInitIdx = result.indexOf('coverage-init');
    const coverageMarkIdx = result.indexOf('coverage-mark');
    const coverageCondIdx = result.indexOf('coverage-cond');

    expect(coverageInitIdx).toBeGreaterThan(templateImportIdx);
    expect(coverageInitIdx).toBeGreaterThan(modifierImportIdx);
    expect(coverageMarkIdx).toBeGreaterThan(templateImportIdx);
    expect(coverageCondIdx).toBeGreaterThan(templateImportIdx);
    expect(coverageCondIdx).toBeGreaterThan(modifierImportIdx);
  });

  it('works with source maps present (any file with template import)', function () {
    const input = [
      'import { template } from "@ember/template-compiler";',
      'const Foo = template("hello", { eval() { return eval(arguments[0]); } });',
    ].join('\n');

    // Even with source maps, the plugin detects via the template import
    const result = babel.transformSync(input, {
      filename: 'test.js',
      plugins: [templateCoverageImportPlugin],
      inputSourceMap: {
        version: 3,
        sources: ['test.gjs'],
        mappings: '',
      },
    });

    expect(result.code).toContain('coverage-init');
    expect(result.code).toContain('coverage-mark');
    expect(result.code).toContain('coverage-cond');
  });
});
