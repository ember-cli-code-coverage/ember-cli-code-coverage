import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { preprocess, print } from '@glimmer/syntax';
import { createTemplateCoveragePlugin } from '../packages/ember-cli-code-coverage/dist/glimmer/index.js';

const MODULE_NAME = 'my-app/templates/application.hbs';

/**
 * Run a template through the coverage AST plugin and return both the
 * rewritten template and the branch map the plugin recorded.
 */
function instrument(template, { moduleName = MODULE_NAME } = {}) {
  const plugin = createTemplateCoveragePlugin();

  const ast = preprocess(template, {
    mode: 'codemod',
    meta: { moduleName },
    plugins: { ast: [plugin] },
  });

  const output = print(ast);
  const initMatch = output.match(/\{\{coverage-init "[^"]*" "(.*?)"\}\}/s);

  return {
    output,
    branchMap: initMatch
      ? JSON.parse(initMatch[1].replace(/\\"/g, '"'))
      : undefined,
  };
}

describe('template coverage AST plugin', function () {
  beforeEach(function () {
    process.env.COVERAGE = 'true';
  });

  afterEach(function () {
    delete process.env.COVERAGE;
  });

  it('leaves templates untouched when coverage is disabled', function () {
    process.env.COVERAGE = 'false';

    const template = '{{#if this.flag}}yes{{/if}}';
    const { output } = instrument(template);

    expect(output).toBe(template);
  });

  it('leaves branch-free templates untouched', function () {
    const template = '<div>hello {{this.name}}</div>';
    const { output } = instrument(template);

    expect(output).toBe(template);
  });

  it('marks both paths of a block conditional', function () {
    const { output, branchMap } = instrument(
      '{{#if this.flag}}yes{{else}}no{{/if}}',
    );

    expect(output).toContain(
      '{{coverage-mark "my-app/templates/application.hbs" 0 0}}yes',
    );
    expect(output).toContain(
      '{{coverage-mark "my-app/templates/application.hbs" 0 1}}no',
    );
    expect(branchMap['0'].type).toBe('if');
    expect(branchMap['0'].locations).toHaveLength(2);
  });

  it('adds an else path to a conditional that has none, so the untaken path is reportable', function () {
    const { output, branchMap } = instrument('{{#if this.flag}}yes{{/if}}');

    expect(output).toContain(
      '{{coverage-mark "my-app/templates/application.hbs" 0 0}}yes',
    );
    expect(output).toContain(
      '{{else}}{{coverage-mark "my-app/templates/application.hbs" 0 1}}',
    );
    expect(branchMap['0'].locations).toHaveLength(2);
  });

  it('gives each link of an else-if chain its own branch', function () {
    const { output, branchMap } = instrument(
      '{{#if this.a}}A{{else if this.b}}B{{else}}C{{/if}}',
    );

    expect(Object.keys(branchMap)).toHaveLength(2);
    // The outer block claims only the path it owns; the chained else is
    // fully described by the nested conditional.
    expect(branchMap['0'].locations).toHaveLength(1);
    expect(branchMap['1'].locations).toHaveLength(2);
    expect(output).toContain(
      '{{coverage-mark "my-app/templates/application.hbs" 1 0}}B',
    );
    expect(output).toContain(
      '{{coverage-mark "my-app/templates/application.hbs" 1 1}}C',
    );
  });

  it('treats an each with an else as an empty-collection branch', function () {
    const { branchMap } = instrument(
      '{{#each this.items as |item|}}{{item}}{{else}}none{{/each}}',
    );

    expect(Object.keys(branchMap)).toHaveLength(1);
    expect(branchMap['0'].locations).toHaveLength(2);
  });

  it('ignores an each with no empty case, which does not branch', function () {
    const { output } = instrument(
      '{{#each this.items as |item|}}{{item}}{{/each}}',
    );

    expect(output).toBe('{{#each this.items as |item|}}{{item}}{{/each}}');
  });

  it('ignores blocks that always render their body', function () {
    const template = '{{#let this.a as |x|}}{{x}}{{/let}}';
    const { output } = instrument(template);

    expect(output).toBe(template);
  });

  it('wraps an inline conditional without changing what it renders', function () {
    const { output, branchMap } = instrument('{{if this.flag "yes" "no"}}');

    // The condition is wrapped; the rendered values are untouched.
    expect(output).toContain(
      '{{if (coverage-cond "my-app/templates/application.hbs" 0 false this.flag) "yes" "no"}}',
    );
    expect(branchMap['0'].type).toBe('cond-expr');
    expect(branchMap['0'].locations).toHaveLength(2);
  });

  it('flags unless as reversed so its first path is the falsy one', function () {
    const { output } = instrument('{{unless this.flag "yes" "no"}}');

    expect(output).toContain(
      '(coverage-cond "my-app/templates/application.hbs" 0 true this.flag)',
    );
  });

  it('wraps inline conditionals used in attribute position', function () {
    const { output } = instrument(
      '<div class={{if this.flag "on" "off"}}></div>',
    );

    expect(output).toContain(
      '(coverage-cond "my-app/templates/application.hbs" 0 false this.flag)',
    );
  });

  it('instruments a conditional nested inside a subexpression', function () {
    const { branchMap } = instrument('{{concat (if this.flag "a" "b")}}');

    expect(Object.keys(branchMap)).toHaveLength(1);
    expect(branchMap['0'].type).toBe('cond-expr');
  });

  it('numbers branches independently per module', function () {
    const first = instrument('{{#if this.a}}A{{/if}}', {
      moduleName: 'app/one.hbs',
    });
    const second = instrument('{{#if this.b}}B{{/if}}', {
      moduleName: 'app/two.hbs',
    });

    expect(Object.keys(first.branchMap)).toEqual(['0']);
    expect(Object.keys(second.branchMap)).toEqual(['0']);
  });
});
