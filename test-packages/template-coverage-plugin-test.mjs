import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'module';
import createTemplateCoveragePlugin from '../packages/ember-cli-code-coverage/lib/template-coverage-plugin.js';

const require = createRequire(import.meta.url);

// Resolve @glimmer/syntax from the addon package where it's installed
const glimmerPath = require.resolve('@glimmer/syntax', {
  paths: [
    new URL('../packages/ember-cli-code-coverage', import.meta.url).pathname,
  ],
});
const { preprocess, print } = require(glimmerPath);

function transform(template, moduleName = 'test-app/templates/test') {
  const plugin = createTemplateCoveragePlugin({ coverageEnvVar: 'COVERAGE' });
  return transformWithPlugin(plugin, template, moduleName);
}

/**
 * Transform a template using an existing plugin instance.
 * Useful for testing multiple <template> blocks that share the same module
 * (simulates .gts files with multiple templates).
 */
function transformWithPlugin(plugin, template, moduleName = 'test-app/templates/test') {
  const ast = preprocess(template, {
    mode: 'codemod',
    plugins: {
      ast: [
        function (env) {
          // Inject a custom moduleName into env.meta
          env.meta = env.meta || {};
          env.meta.moduleName = moduleName;
          return plugin(env);
        },
      ],
    },
    meta: { moduleName },
  });
  return print(ast);
}

/**
 * Extract the branchMap JSON from a transformed template string.
 * The coverageInit call looks like: {{coverageInit "moduleName" "{\"0\":{...}}"}}
 * We need to extract the second string argument which contains escaped JSON.
 */
function extractBranchMap(result) {
  // Match the second quoted argument of coverageInit, handling escaped quotes
  const initMatch = result.match(
    /coverageInit "[^"]*" "((?:[^"\\]|\\.)*)"/
  );
  if (!initMatch) return null;
  // Unescape the JSON string (\\\" -> \", \\\\ -> \\)
  const jsonStr = initMatch[1].replace(/\\(.)/g, '$1');
  return JSON.parse(jsonStr);
}

describe('template-coverage-plugin', function () {
  let originalCoverage;

  beforeEach(function () {
    originalCoverage = process.env.COVERAGE;
    process.env.COVERAGE = 'true';
  });

  afterEach(function () {
    if (originalCoverage === undefined) {
      delete process.env.COVERAGE;
    } else {
      process.env.COVERAGE = originalCoverage;
    }
  });

  describe('when COVERAGE is not enabled', function () {
    it('does not instrument templates', function () {
      process.env.COVERAGE = 'false';

      const input = '{{#if condition}}yes{{/if}}';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageInit');
    });
  });

  describe('{{#if}} blocks', function () {
    it('instruments a simple if block', function () {
      const input = '{{#if condition}}yes{{/if}}';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageMark');
      // Should have the module name
      expect(result).toContain('test-app/templates/test');
    });

    it('instruments if/else blocks', function () {
      const input = '{{#if condition}}yes{{else}}no{{/if}}';
      const result = transform(input);

      // Should have coverageInit at the start
      expect(result).toContain('coverageInit');
      // Should have coverageMark in both branches
      // Branch 0, location 0 (consequent)
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      // Branch 0, location 1 (alternate)
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );
    });

    it('instruments chained else-if blocks', function () {
      const input =
        '{{#if a}}first{{else if b}}second{{else}}third{{/if}}';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      // First if: branch 0
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );
      // Inner if: branch 1
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 1 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 1 1}}'
      );
    });

    it('handles if block without else (no implicit else location)', function () {
      const input = '{{#if condition}}yes{{/if}}';
      const result = transform(input);

      // Should have coverageMark for the consequent
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      // Should NOT have coverageMark for an implicit else
      expect(result).not.toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );

      // branchMap should have only 1 location (the if-body).
      // Absent {{else}} is treated as always-visited empty content,
      // so Istanbul won't report "else path not taken".
      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].locations).toHaveLength(1);
    });

    it('if/else still has 2 locations', function () {
      const input = '{{#if condition}}yes{{else}}no{{/if}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap['0'].locations).toHaveLength(2);
    });
  });

  describe('{{#unless}} blocks', function () {
    it('instruments unless blocks', function () {
      const input = '{{#unless condition}}no{{/unless}}';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
    });

    it('instruments unless/else blocks', function () {
      const input = '{{#unless condition}}no{{else}}yes{{/unless}}';
      const result = transform(input);

      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );
    });
  });

  describe('{{#each}} blocks', function () {
    it('does not instrument each without else', function () {
      const input = '{{#each items as |item|}}{{item}}{{/each}}';
      const result = transform(input);

      // No branches, so no coverage-init or coverage-mark
      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageMark');
    });

    it('instruments each/else blocks', function () {
      const input =
        '{{#each items as |item|}}{{item}}{{else}}empty{{/each}}';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      // Branch 0, location 0 (items exist)
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      // Branch 0, location 1 (empty list)
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );
    });
  });

  describe('{{#each-in}} blocks', function () {
    it('instruments each-in/else blocks', function () {
      const input =
        '{{#each-in obj as |key val|}}{{key}}{{else}}empty{{/each-in}}';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );
    });
  });

  describe('non-branching blocks', function () {
    it('does not instrument {{#let}} blocks', function () {
      const input = '{{#let (hash a=1) as |h|}}{{h.a}}{{/let}}';
      const result = transform(input);

      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageMark');
    });

    it('does not instrument {{#in-element}} blocks', function () {
      const input = '{{#in-element this.target}}content{{/in-element}}';
      const result = transform(input);

      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageMark');
    });

    it('does not instrument {{#-in-element}} blocks', function () {
      const input = '{{#-in-element this.target}}content{{/-in-element}}';
      const result = transform(input);

      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageMark');
    });
  });

  describe('multiple branches in one template', function () {
    it('assigns unique branch IDs', function () {
      const input = [
        '{{#if a}}first{{else}}second{{/if}}',
        '{{#if b}}third{{else}}fourth{{/if}}',
      ].join('\n');
      const result = transform(input);

      // First if: branch 0
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );
      // Second if: branch 1
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 1 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 1 1}}'
      );
    });
  });

  describe('nested branches', function () {
    it('instruments all nested levels', function () {
      const input = [
        '{{#if a}}',
        '  {{#if b}}inner-yes{{else}}inner-no{{/if}}',
        '{{else}}',
        '  outer-no',
        '{{/if}}',
      ].join('\n');
      const result = transform(input);

      // Outer if: one branch
      // Inner if: another branch
      expect(result).toContain('coverageInit');

      // We should have marks for both branches (exact IDs depend on visit order)
      const markCount = (result.match(/coverageMark/g) || []).length;
      // outer: 2 (consequent + alternate) + inner: 2 (consequent + alternate)
      expect(markCount).toBe(4);
    });
  });

  describe('coverageInit branchMap format', function () {
    it('produces valid Istanbul-compatible branchMap JSON', function () {
      const input = '{{#if cond}}yes{{else}}no{{/if}}';
      const result = transform(input);

      // Extract the branchMap JSON from the coverageInit call
      const branchMap = extractBranchMap(result);

      expect(branchMap).toHaveProperty('0');
      expect(branchMap['0']).toHaveProperty('type', 'if');
      expect(branchMap['0']).toHaveProperty('locations');
      expect(branchMap['0'].locations).toHaveLength(2);
      expect(branchMap['0']).toHaveProperty('loc');
      expect(branchMap['0'].loc).toHaveProperty('start');
      expect(branchMap['0'].loc).toHaveProperty('end');

      // Each location should have start and end
      for (const loc of branchMap['0'].locations) {
        expect(loc).toHaveProperty('start');
        expect(loc.start).toHaveProperty('line');
        expect(loc.start).toHaveProperty('column');
        expect(loc).toHaveProperty('end');
      }
    });
  });

  describe('custom module names', function () {
    it('uses the provided module name', function () {
      const input = '{{#if cond}}yes{{/if}}';
      const result = transform(input, 'my-addon/components/fancy');

      expect(result).toContain('my-addon/components/fancy');
    });
  });

  describe('custom coverage env var', function () {
    it('respects custom env var name', function () {
      delete process.env.COVERAGE;
      process.env.MY_COV = 'true';

      const plugin = createTemplateCoveragePlugin({
        coverageEnvVar: 'MY_COV',
      });
      const ast = preprocess('{{#if cond}}yes{{/if}}', {
        mode: 'codemod',
        plugins: {
          ast: [
            function (env) {
              env.meta = { moduleName: 'test' };
              return plugin(env);
            },
          ],
        },
        meta: { moduleName: 'test' },
      });
      const result = print(ast);

      expect(result).toContain('coverageMark');

      delete process.env.MY_COV;
    });
  });

  describe('plain template without branches', function () {
    it('does not instrument a template with no conditionals', function () {
      const input = '<div>Hello</div>';
      const result = transform(input);

      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageCond');
    });
  });

  describe('inline {{if}} MustacheStatement', function () {
    it('instruments inline {{if condition "yes" "no"}}', function () {
      const input = '<div>{{if condition "yes" "no"}}</div>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageCond');
      // Should wrap the condition with coverageCond
      expect(result).toContain('test-app/templates/test');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0']).toBeTruthy();
      expect(branchMap['0'].type).toBe('cond');
      expect(branchMap['0'].locations).toHaveLength(2);
    });

    it('instruments inline {{unless condition "no"}}', function () {
      const input = '<div>{{unless condition "fallback"}}</div>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageCond');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].type).toBe('cond');
    });

    it('does not instrument {{if}} with only 1 param (just condition)', function () {
      // {{if condition}} with no trueVal is not a valid inline conditional to instrument
      // The plugin requires at least 2 params
      const input = '<div>{{if condition}}</div>';
      const result = transform(input);

      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageCond');
    });
  });

  describe('inline (if) SubExpression', function () {
    it('instruments inline (if condition "yes" "no") in SubExpression position', function () {
      const input = '<div class={{if isActive "active" "inactive"}}></div>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageCond');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].type).toBe('cond');
      expect(branchMap['0'].locations).toHaveLength(2);
    });

    it('instruments inline (unless condition "no" "yes") with both branches', function () {
      const input = '<div class={{unless isHidden "visible" "hidden"}}></div>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageCond');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].type).toBe('cond');
    });

    it('instruments (if condition "yes") without falseVal (2 params)', function () {
      const input = '<div class={{if isActive "active"}}></div>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageCond');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].type).toBe('cond');
      expect(branchMap['0'].locations).toHaveLength(2);
    });

    it('does not instrument (if) with only 1 param (just condition)', function () {
      // (if condition) with no trueVal should NOT be instrumented
      // This is a SubExpression with only 1 param
      const input = '{{someHelper (if condition)}}';
      const result = transform(input);

      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageCond');
    });
  });

  describe('coverageCond wrapping behavior', function () {
    it('wraps condition with reversed=false for inline if', function () {
      const input = '<div class={{if isActive "active" "inactive"}}></div>';
      const result = transform(input);

      // For `if`, reversed should be false
      expect(result).toContain('coverageCond');
      // The output should contain the coverageCond call with false for reversed
      expect(result).toMatch(/coverageCond\s+"[^"]+"\s+0\s+false/);
    });

    it('wraps condition with reversed=true for inline unless', function () {
      const input = '<div class={{unless isHidden "visible" "hidden"}}></div>';
      const result = transform(input);

      // For `unless`, reversed should be true
      expect(result).toContain('coverageCond');
      expect(result).toMatch(/coverageCond\s+"[^"]+"\s+0\s+true/);
    });
  });

  describe('inline conditional branchMap type vs block branchMap type', function () {
    it('uses type "cond" for inline conditionals', function () {
      const input = '<div>{{if cond "a" "b"}}</div>';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap['0'].type).toBe('cond');
    });

    it('uses type "if" for block if', function () {
      const input = '{{#if cond}}yes{{else}}no{{/if}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap['0'].type).toBe('if');
    });

    it('uses type "unless" for block unless', function () {
      const input = '{{#unless cond}}no{{else}}yes{{/unless}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap['0'].type).toBe('unless');
    });

    it('uses type "each" for each/else blocks', function () {
      const input = '{{#each items as |item|}}{{item}}{{else}}empty{{/each}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap['0'].type).toBe('each');
    });
  });

  describe('template with ONLY inline conditionals (no blocks)', function () {
    it('still gets coverageInit injected', function () {
      const input = '<div class={{if isActive "active" "inactive"}}>{{unless isHidden "show"}}</div>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      // Should NOT contain coverageMark (no block branches)
      expect(result).not.toContain('coverageMark');
      // Should contain coverageCond for the inline conditionals
      expect(result).toContain('coverageCond');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      // Two inline conditionals -> two branches
      expect(Object.keys(branchMap)).toHaveLength(2);
      expect(branchMap['0'].type).toBe('cond');
      expect(branchMap['1'].type).toBe('cond');
    });
  });

  describe('mixed block + inline conditionals', function () {
    it('assigns unique branch IDs across block and inline conditionals', function () {
      const input = [
        '{{#if blockCond}}yes{{else}}no{{/if}}',
        '<div class={{if inlineCond "a" "b"}}></div>',
      ].join('\n');
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageMark');
      expect(result).toContain('coverageCond');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      // Branch 0 = block if, branch 1 = inline if
      expect(Object.keys(branchMap)).toHaveLength(2);
      expect(branchMap['0'].type).toBe('if');
      expect(branchMap['1'].type).toBe('cond');
    });
  });

  describe('deeply nested inline conditionals', function () {
    it('instruments nested inline conditionals', function () {
      // (if a (if b "deep-yes" "deep-no") "outer-no")
      const input = '<div class={{if a (if b "deep-yes" "deep-no") "outer-no"}}></div>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageCond');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      // Two inline conditionals: outer (if a ...) and inner (if b ...)
      expect(Object.keys(branchMap)).toHaveLength(2);
      expect(branchMap['0'].type).toBe('cond');
      expect(branchMap['1'].type).toBe('cond');
    });

    it('instruments triple-nested inline conditionals', function () {
      const input = '<div>{{if a (if b (if c "deep" "c-no") "b-no") "a-no"}}</div>';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(Object.keys(branchMap)).toHaveLength(3);
      // All should be type "cond"
      for (const key of Object.keys(branchMap)) {
        expect(branchMap[key].type).toBe('cond');
      }
    });
  });

  describe('when COVERAGE is not enabled - inline conditionals', function () {
    it('does not instrument inline conditionals', function () {
      process.env.COVERAGE = 'false';

      const input = '<div class={{if cond "a" "b"}}></div>';
      const result = transform(input);

      expect(result).not.toContain('coverageCond');
      expect(result).not.toContain('coverageInit');
    });
  });

  describe('inline conditional location accuracy', function () {
    it('points locations[0] at the trueVal and locations[1] at the falseVal for {{if isActive "on" "off"}}', function () {
      const input = '{{if isActive "on" "off"}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      const branch = branchMap['0'];
      expect(branch.type).toBe('cond');
      expect(branch.locations).toHaveLength(2);

      // locations[0] should point to "on" (the consequent value param)
      const onLoc = branch.locations[0];
      expect(onLoc.start.line).toBe(1);
      expect(onLoc.start.column).toBe(14);
      expect(onLoc.end.line).toBe(1);
      expect(onLoc.end.column).toBe(18);

      // locations[1] should point to "off" (the alternate value param)
      const offLoc = branch.locations[1];
      expect(offLoc.start.line).toBe(1);
      expect(offLoc.start.column).toBe(19);
      expect(offLoc.end.line).toBe(1);
      expect(offLoc.end.column).toBe(24);
    });

    it('uses a zero-width span at end of expression for missing falseVal in {{if isActive "on"}}', function () {
      const input = '{{if isActive "on"}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      const branch = branchMap['0'];
      expect(branch.type).toBe('cond');
      expect(branch.locations).toHaveLength(2);

      // locations[0] should point to "on"
      const onLoc = branch.locations[0];
      expect(onLoc.start.line).toBe(1);
      expect(onLoc.start.column).toBe(14);
      expect(onLoc.end.line).toBe(1);
      expect(onLoc.end.column).toBe(18);

      // locations[1] should be a zero-width span at the end of the whole expression
      const implicitLoc = branch.locations[1];
      expect(implicitLoc.start.line).toBe(implicitLoc.end.line);
      expect(implicitLoc.start.column).toBe(implicitLoc.end.column);
      // Should be at the end of the node (end of "{{if isActive "on"}}")
      expect(implicitLoc.start.line).toBe(branch.loc.end.line);
      expect(implicitLoc.start.column).toBe(branch.loc.end.column);
    });
  });

  describe('block conditional location accuracy', function () {
    it('points branchMap locations at program/inverse bodies for multi-line block', function () {
      const input = '{{#if cond}}\n  yes\n{{else}}\n  no\n{{/if}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      const branch = branchMap['0'];
      expect(branch.type).toBe('if');
      expect(branch.locations).toHaveLength(2);

      // locations[0] = the program body (consequent), should start after {{#if cond}}
      const programLoc = branch.locations[0];
      // The program body starts on line 1 (after the opening tag) and ends at line 3
      expect(programLoc.start.line).toBeGreaterThanOrEqual(1);
      expect(programLoc.end.line).toBeGreaterThanOrEqual(2);
      // Program loc should NOT be the same as the whole node loc
      // (it should be the body, not the entire {{#if}}...{{/if}})
      expect(programLoc).not.toEqual(branch.loc);

      // locations[1] = the inverse body (alternate), should point to the else block
      const inverseLoc = branch.locations[1];
      expect(inverseLoc.start.line).toBeGreaterThanOrEqual(3);
      expect(inverseLoc.end.line).toBeGreaterThanOrEqual(4);
      expect(inverseLoc).not.toEqual(branch.loc);
    });
  });

  describe('statementMap generation from branchMap', function () {
    it('builds statementMap entries matching branch locations (simulating coverage-init)', function () {
      const input = [
        '{{#if a}}yes{{else}}no{{/if}}',
        '<div>{{if b "x" "y"}}</div>',
      ].join('\n');
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();

      // Simulate what coverage-init does: build statementMap from branchMap
      let statementMap = {};
      let s = {};
      let b = {};
      let branchStmtMap = {};
      let stmtId = 0;
      let ids = Object.keys(branchMap);
      for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        let branch = branchMap[id];
        b[id] = branch.locations.map(function () {
          return 0;
        });
        for (let j = 0; j < branch.locations.length; j++) {
          branchStmtMap[id + ':' + j] = stmtId;
          statementMap[stmtId] = branch.locations[j];
          s[stmtId] = 0;
          stmtId++;
        }
      }

      // Two branches, each with 2 locations = 4 synthetic statements
      expect(Object.keys(statementMap)).toHaveLength(4);
      expect(Object.keys(s)).toHaveLength(4);

      // Each statement counter starts at 0
      for (const key of Object.keys(s)) {
        expect(s[key]).toBe(0);
      }

      // Each statement location matches a branch location
      // Branch 0 (block if): locations[0] -> stmt 0, locations[1] -> stmt 1
      expect(statementMap[0]).toEqual(branchMap['0'].locations[0]);
      expect(statementMap[1]).toEqual(branchMap['0'].locations[1]);
      // Branch 1 (inline if): locations[0] -> stmt 2, locations[1] -> stmt 3
      expect(statementMap[2]).toEqual(branchMap['1'].locations[0]);
      expect(statementMap[3]).toEqual(branchMap['1'].locations[1]);

      // branchStmtMap maps "branchId:locationId" -> stmtId
      expect(branchStmtMap['0:0']).toBe(0);
      expect(branchStmtMap['0:1']).toBe(1);
      expect(branchStmtMap['1:0']).toBe(2);
      expect(branchStmtMap['1:1']).toBe(3);

      // Branch counters initialized to zeros with correct length
      expect(b['0']).toEqual([0, 0]);
      expect(b['1']).toEqual([0, 0]);
    });
  });

  describe('buildTemplateCoveragePlugin method', function () {
    let buildTemplateCoveragePlugin;

    beforeEach(async function () {
      // Dynamically require index.js to access buildTemplateCoveragePlugin
      const require = createRequire(import.meta.url);
      const indexPath = new URL(
        '../packages/ember-cli-code-coverage/index.js',
        import.meta.url
      ).pathname;
      // Clear the require cache so env changes take effect
      delete require.cache[require.resolve(indexPath)];
      const addon = require(indexPath);
      buildTemplateCoveragePlugin = addon.buildTemplateCoveragePlugin;
    });

    it('returns an empty array when COVERAGE is not "true"', function () {
      process.env.COVERAGE = 'false';

      const result = buildTemplateCoveragePlugin();
      expect(result).toEqual([]);
    });

    it('returns an empty array when COVERAGE is undefined', function () {
      delete process.env.COVERAGE;

      const result = buildTemplateCoveragePlugin();
      expect(result).toEqual([]);
    });

    it('returns an array with a plugin function when COVERAGE is "true"', function () {
      process.env.COVERAGE = 'true';

      const result = buildTemplateCoveragePlugin();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('function');
    });

    it('respects a custom coverageEnvVar option', function () {
      delete process.env.COVERAGE;
      process.env.MY_CUSTOM_COV = 'true';

      const result = buildTemplateCoveragePlugin({
        coverageEnvVar: 'MY_CUSTOM_COV',
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('function');

      delete process.env.MY_CUSTOM_COV;
    });

    it('returns empty array for custom env var when that var is not "true"', function () {
      delete process.env.COVERAGE;
      process.env.MY_CUSTOM_COV = 'false';

      const result = buildTemplateCoveragePlugin({
        coverageEnvVar: 'MY_CUSTOM_COV',
      });
      expect(result).toEqual([]);

      delete process.env.MY_CUSTOM_COV;
    });
  });

  describe('mixed inline + block with correct location types', function () {
    it('block locations point to program/inverse bodies while inline locations point to value params', function () {
      const input = [
        '{{#if blockCond}}',
        '  block-yes',
        '{{else}}',
        '  block-no',
        '{{/if}}',
        '<div class={{if inlineCond "active" "inactive"}}></div>',
      ].join('\n');
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(Object.keys(branchMap)).toHaveLength(2);

      // Branch 0 = block if
      const blockBranch = branchMap['0'];
      expect(blockBranch.type).toBe('if');
      expect(blockBranch.locations).toHaveLength(2);

      // Block locations should point to program/inverse bodies, not the whole node
      // The program body spans multiple lines (line 1-3 area)
      const blockProgram = blockBranch.locations[0];
      const blockInverse = blockBranch.locations[1];
      // Program and inverse are different sections of the template
      expect(blockProgram).not.toEqual(blockInverse);
      // Neither should be the whole node loc
      expect(blockProgram).not.toEqual(blockBranch.loc);
      expect(blockInverse).not.toEqual(blockBranch.loc);

      // Branch 1 = inline if
      const inlineBranch = branchMap['1'];
      expect(inlineBranch.type).toBe('cond');
      expect(inlineBranch.locations).toHaveLength(2);

      // Inline locations should point to the specific value params ("active" and "inactive")
      const consequentLoc = inlineBranch.locations[0];
      const alternateLoc = inlineBranch.locations[1];
      // Both should be on the same line (line 6)
      expect(consequentLoc.start.line).toBe(6);
      expect(alternateLoc.start.line).toBe(6);
      // The consequent comes before the alternate
      expect(consequentLoc.start.column).toBeLessThan(
        alternateLoc.start.column
      );
      // Inline locations are small spans (a single string literal), not multi-line blocks
      expect(consequentLoc.start.line).toBe(consequentLoc.end.line);
      expect(alternateLoc.start.line).toBe(alternateLoc.end.line);
    });
  });

  describe('named block coverage', function () {
    it('instruments a single named block <:default>', function () {
      const input = '<MyComponent>\n  <:default>Default content</:default>\n</MyComponent>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageMark');
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].type).toBe('named-block');
      expect(branchMap['0'].locations).toHaveLength(2);
    });

    it('instruments multiple named blocks <:header>, <:body>, <:footer>', function () {
      const input = [
        '<MyComponent>',
        '  <:header>Header content</:header>',
        '  <:body>Body content</:body>',
        '  <:footer>Footer content</:footer>',
        '</MyComponent>',
      ].join('\n');
      const result = transform(input);

      expect(result).toContain('coverageInit');
      // Each named block gets its own branch
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 1 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 2 0}}'
      );

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(Object.keys(branchMap)).toHaveLength(3);
      expect(branchMap['0'].type).toBe('named-block');
      expect(branchMap['1'].type).toBe('named-block');
      expect(branchMap['2'].type).toBe('named-block');
    });

    it('named block branchMap type is "named-block"', function () {
      const input = '<MyComponent>\n  <:header>Header</:header>\n</MyComponent>';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].type).toBe('named-block');
    });

    it('named blocks get unique branch IDs alongside other branch types', function () {
      const input = [
        '{{#if cond}}yes{{else}}no{{/if}}',
        '<MyComponent>',
        '  <:header>Header</:header>',
        '</MyComponent>',
      ].join('\n');
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(Object.keys(branchMap)).toHaveLength(2);
      // Branch 0 = if block, Branch 1 = named block
      expect(branchMap['0'].type).toBe('if');
      expect(branchMap['1'].type).toBe('named-block');
    });

    it('handles mixed named blocks + if/else blocks', function () {
      const input = [
        '<MyComponent>',
        '  <:header>',
        '    {{#if showTitle}}Title{{else}}No Title{{/if}}',
        '  </:header>',
        '  <:body>Body content</:body>',
        '</MyComponent>',
      ].join('\n');
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      // Named block <:header> + if/else inside it + named block <:body>
      expect(Object.keys(branchMap)).toHaveLength(3);

      // Visitor order: ElementNode for <:header>, then BlockStatement for if/else inside,
      // then ElementNode for <:body>
      // The actual order depends on Glimmer's traversal; let's just check types exist
      const types = Object.values(branchMap).map(function (b) {
        return b.type;
      });
      expect(types.filter(function (t) { return t === 'named-block'; })).toHaveLength(2);
      expect(types.filter(function (t) { return t === 'if'; })).toHaveLength(1);
    });

    it('handles empty named blocks', function () {
      const input = '<MyComponent>\n  <:header></:header>\n</MyComponent>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageMark');

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      expect(branchMap['0'].type).toBe('named-block');
      expect(branchMap['0'].locations).toHaveLength(2);
    });

    it('each named block has two locations (rendered + implicit not-rendered)', function () {
      const input = [
        '<MyComponent>',
        '  <:header>Header</:header>',
        '  <:body>Body</:body>',
        '</MyComponent>',
      ].join('\n');
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      // Each named block branch has 2 locations (rendered + implicit not-rendered)
      for (const key of Object.keys(branchMap)) {
        expect(branchMap[key].type).toBe('named-block');
        expect(branchMap[key].locations).toHaveLength(2);
        // Location 0 (rendered) has start and end spanning the block
        expect(branchMap[key].locations[0]).toHaveProperty('start');
        expect(branchMap[key].locations[0]).toHaveProperty('end');
        expect(branchMap[key].locations[0].start).toHaveProperty('line');
        expect(branchMap[key].locations[0].start).toHaveProperty('column');
        // Location 1 (not-rendered) is a zero-width span at the block end
        expect(branchMap[key].locations[1].start).toEqual(
          branchMap[key].locations[0].end
        );
      }
    });

    it('does not instrument regular elements (non-named-blocks)', function () {
      const input = '<div>Hello</div><span>World</span>';
      const result = transform(input);

      expect(result).not.toContain('coverageInit');
      expect(result).not.toContain('coverageMark');
    });

    it('named block loc points to the element node location', function () {
      const input = '<MyComponent>\n  <:header>Header content</:header>\n</MyComponent>';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).toBeTruthy();
      const branch = branchMap['0'];
      expect(branch.loc).toHaveProperty('start');
      expect(branch.loc).toHaveProperty('end');
      // The loc should cover the named block element
      expect(branch.loc.start.line).toBe(2);
    });
  });

  describe('implicit default block coverage', function () {
    it('instruments <MyComponent>content</MyComponent> as a default-block branch', function () {
      const input = '<MyComponent>default content</MyComponent>';
      const result = transform(input);

      expect(result).toContain('coverageInit');
      expect(result).toContain('coverageMark');

      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0']).toBeDefined();
      expect(branchMap['0'].type).toBe('default-block');
      expect(branchMap['0'].locations).toHaveLength(2);
    });

    it('instruments dotted component invocations (e.g. <foo.bar>)', function () {
      const input = '<foo.bar>some content</foo.bar>';
      const result = transform(input);

      expect(result).toContain('coverageMark');

      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].type).toBe('default-block');
    });

    it('does not instrument regular HTML elements', function () {
      const input = '<div>hello</div>';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageInit');
    });

    it('does not instrument self-closing components (no children)', function () {
      const input = '<MyComponent />';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageInit');
    });

    it('does not instrument components with empty children', function () {
      const input = '<MyComponent></MyComponent>';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageInit');
    });

    it('does not instrument components whose children are all named blocks', function () {
      const input = '<MyComponent><:header>h</:header><:body>b</:body></MyComponent>';
      const result = transform(input);

      // Named blocks themselves should be instrumented, but no default-block branch
      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      const types = Object.values(branchMap).map(function (b) { return b.type; });
      expect(types).not.toContain('default-block');
      expect(types.filter(function (t) { return t === 'named-block'; })).toHaveLength(2);
    });

    it('instruments default block alongside other branch types', function () {
      const input = '<MyComponent>{{#if cond}}yes{{/if}}</MyComponent>';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      const types = Object.values(branchMap).map(function (b) { return b.type; });
      expect(types).toContain('default-block');
      expect(types).toContain('if');
    });

    it('default-block branch has 2 locations (rendered + implicit not-rendered)', function () {
      const input = '<MyComponent>\n  Some content\n</MyComponent>';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].locations).toHaveLength(2);
      // Second location (not-rendered) is zero-width at end of node
      const loc0 = branchMap['0'].locations[0];
      const loc1 = branchMap['0'].locations[1];
      expect(loc0.start).toBeDefined();
      expect(loc1.start).toEqual(loc1.end);
    });

    it('injects coverageMark at the beginning of component children', function () {
      const input = '<MyComponent>hello</MyComponent>';
      const result = transform(input);

      // coverageMark should appear before the content
      const markIdx = result.indexOf('coverageMark');
      const contentIdx = result.indexOf('hello');
      expect(markIdx).toBeLessThan(contentIdx);
    });

    it('detects components by @-prefixed attributes', function () {
      const input = '<my-thing @value={{1}}>content</my-thing>';
      const result = transform(input);

      expect(result).toContain('coverageMark');
      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].type).toBe('default-block');
    });

    it('detects components by block params (as |...|)', function () {
      const input = '<my-thing as |item|>{{item}}</my-thing>';
      const result = transform(input);

      expect(result).toContain('coverageMark');
      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].type).toBe('default-block');
    });

    it('does not instrument lowercase elements without component signals', function () {
      const input = '<my-thing>content</my-thing>';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageInit');
    });

    it('instruments built-in Ember components like <LinkTo>', function () {
      const input = '<LinkTo @route="home">Go home</LinkTo>';
      const result = transform(input);

      expect(result).toContain('coverageMark');
      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].type).toBe('default-block');
    });

    it('does not instrument self-closing built-in components like <Input />', function () {
      const input = '<Input @type="text" @value={{this.name}} />';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
    });
  });

  describe('curly component block coverage', function () {
    it('instruments {{#my-component}}...{{/my-component}}', function () {
      const input = '{{#my-component}}block content{{/my-component}}';
      const result = transform(input);

      expect(result).toContain('coverageMark');
      expect(result).toContain('coverageInit');
      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].type).toBe('default-block');
    });

    it('instruments {{#my-component}}...{{else}}...{{/my-component}}', function () {
      const input =
        '{{#my-component}}default{{else}}inverse{{/my-component}}';
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].type).toBe('default-block');
      expect(branchMap['0'].locations).toHaveLength(2);
      // Both branches instrumented
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 0}}'
      );
      expect(result).toContain(
        '{{coverageMark "test-app/templates/test" 0 1}}'
      );
    });

    it('does not instrument {{#let}} as a curly component', function () {
      const input = '{{#let (hash a=1) as |h|}}{{h.a}}{{/let}}';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageInit');
    });

    it('does not instrument {{#with}} as a curly component', function () {
      const input = '{{#with foo as |bar|}}{{bar}}{{/with}}';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageInit');
    });

    it('assigns unique branch IDs alongside other branch types', function () {
      const input = [
        '{{#if cond}}yes{{/if}}',
        '{{#my-component}}content{{/my-component}}',
      ].join('\n');
      const result = transform(input);

      const branchMap = extractBranchMap(result);
      expect(branchMap).not.toBeNull();
      expect(branchMap['0'].type).toBe('if');
      expect(branchMap['1'].type).toBe('default-block');
    });
  });

  describe('{{yield}} non-instrumentation', function () {
    it('does not instrument {{yield}}', function () {
      const input = '{{yield}}';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageCond');
      expect(result).not.toContain('coverageInit');
    });

    it('does not instrument {{yield to="inverse"}}', function () {
      const input = '{{yield to="inverse"}}';
      const result = transform(input);

      expect(result).not.toContain('coverageMark');
      expect(result).not.toContain('coverageCond');
      expect(result).not.toContain('coverageInit');
    });
  });

  describe('buildBabelPlugin v8 compat mode', function () {
    let buildBabelPlugin;

    beforeEach(async function () {
      const require = createRequire(import.meta.url);
      const indexPath = new URL(
        '../packages/ember-cli-code-coverage/index.js',
        import.meta.url
      ).pathname;
      delete require.cache[require.resolve(indexPath)];
      const addon = require(indexPath);
      buildBabelPlugin = addon.buildBabelPlugin;
    });

    it('returns only the import plugin when v8: true and COVERAGE=true', function () {
      process.env.COVERAGE = 'true';

      const result = buildBabelPlugin({ v8: true });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      // Should be the template-coverage-import-plugin path
      expect(result[0]).toContain('template-coverage-import-plugin');
      // Should NOT contain istanbul or gjs-gts-istanbul-ignore
      expect(result.join(',')).not.toContain('istanbul');
      expect(result.join(',')).not.toContain('gjs-gts-istanbul-ignore');
    });

    it('returns empty array when v8: true and COVERAGE is not true', function () {
      process.env.COVERAGE = 'false';

      const result = buildBabelPlugin({ v8: true });
      expect(result).toEqual([]);
    });

    it('returns full plugin set (with istanbul) when v8 is not set', function () {
      process.env.COVERAGE = 'true';

      const result = buildBabelPlugin();

      expect(result.length).toBeGreaterThanOrEqual(2);
      // Should contain both the import plugin and istanbul
      const pluginStr = result
        .map((p) => (Array.isArray(p) ? p[0] : p))
        .join(',');
      expect(pluginStr).toContain('template-coverage-import-plugin');
      expect(pluginStr).toContain('istanbul');
    });

    it('v8 mode does not include gjs-gts-istanbul-ignore plugin', function () {
      process.env.COVERAGE = 'true';

      const v8Result = buildBabelPlugin({ v8: true });
      const pluginStr = v8Result
        .map((p) => (Array.isArray(p) ? p[0] : p))
        .join(',');
      expect(pluginStr).not.toContain('gjs-gts-istanbul-ignore');
    });

    it('v8 mode works with embroider: true (v8 takes precedence)', function () {
      process.env.COVERAGE = 'true';

      const result = buildBabelPlugin({ v8: true, embroider: true });

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('template-coverage-import-plugin');
    });
  });

  describe('plugins are parallelizable (broccoli-babel-transpiler compat)', function () {
    // broccoli-babel-transpiler checks _parallelBabel on plugin functions/objects
    // to enable parallel transpilation. Our plugins must support this.
    function implementsParallelAPI(object) {
      const type = typeof object;
      const hasProperties =
        type === 'function' ||
        (type === 'object' && object !== null) ||
        Array.isArray(object);
      return (
        hasProperties &&
        object._parallelBabel !== null &&
        typeof object._parallelBabel === 'object' &&
        typeof object._parallelBabel.requireFile === 'string'
      );
    }

    it('template-coverage-import-plugin has _parallelBabel', function () {
      const require = createRequire(import.meta.url);
      const plugin = require(
        '../packages/ember-cli-code-coverage/lib/template-coverage-import-plugin.js'
      );
      expect(typeof plugin).toBe('function');
      expect(implementsParallelAPI(plugin)).toBe(true);
      expect(plugin._parallelBabel.requireFile).toContain(
        'template-coverage-import-plugin'
      );
    });

    it('gjs-gts-istanbul-ignore-template-plugin has _parallelBabel', function () {
      const require = createRequire(import.meta.url);
      const plugin = require(
        '../packages/ember-cli-code-coverage/lib/gjs-gts-istanbul-ignore-template-plugin.js'
      );
      expect(typeof plugin).toBe('function');
      expect(implementsParallelAPI(plugin)).toBe(true);
      expect(plugin._parallelBabel.requireFile).toContain(
        'gjs-gts-istanbul-ignore-template-plugin'
      );
    });

    it('istanbul plugin entry has _parallelBabel on the array', function () {
      process.env.COVERAGE = 'true';
      const require = createRequire(import.meta.url);
      const indexPath = new URL(
        '../packages/ember-cli-code-coverage/index.js',
        import.meta.url
      ).pathname;
      delete require.cache[require.resolve(indexPath)];
      const addon = require(indexPath);
      const plugins = addon.buildBabelPlugin();

      // Find the istanbul entry (array with _parallelBabel)
      const istanbulEntry = plugins.find(
        (p) => Array.isArray(p) && p._parallelBabel
      );
      expect(istanbulEntry).toBeTruthy();
      expect(implementsParallelAPI(istanbulEntry)).toBe(true);
      expect(istanbulEntry._parallelBabel.requireFile).toContain(
        'istanbul-plugin-wrapper'
      );
      expect(istanbulEntry._parallelBabel.buildUsing).toBe(
        'buildIstanbulPlugin'
      );
      expect(istanbulEntry._parallelBabel.params).toHaveProperty('cwd');
    });

    it('all plugins from buildBabelPlugin() are serializable or have _parallelBabel', function () {

      process.env.COVERAGE = 'true';
      const require = createRequire(import.meta.url);
      const indexPath = new URL(
        '../packages/ember-cli-code-coverage/index.js',
        import.meta.url
      ).pathname;
      delete require.cache[require.resolve(indexPath)];
      const addon = require(indexPath);
      const plugins = addon.buildBabelPlugin();

      for (const plugin of plugins) {
        if (typeof plugin === 'string') {
          // String paths are serializable - load and check for _parallelBabel
          const loaded = require(plugin);
          expect(implementsParallelAPI(loaded)).toBe(true);
        } else if (Array.isArray(plugin)) {
          // [path, options] tuples with optional _parallelBabel
          expect(typeof plugin[0]).toBe('string');
          if (plugin._parallelBabel) {
            expect(implementsParallelAPI(plugin)).toBe(true);
          }
        }
      }
    });
  });

  describe('multiple <template> blocks per module (.gts files)', function () {
    it('assigns unique branchIds across templates sharing the same module name', function () {
      const plugin = createTemplateCoveragePlugin({ coverageEnvVar: 'COVERAGE' });
      const moduleName = 'my-app/components/multi-template';

      const template1 = '{{#if cond1}}yes{{else}}no{{/if}}';
      const template2 = '{{#if cond2}}a{{else}}b{{/if}}';

      const result1 = transformWithPlugin(plugin, template1, moduleName);
      const result2 = transformWithPlugin(plugin, template2, moduleName);

      const branchMap1 = extractBranchMap(result1);
      const branchMap2 = extractBranchMap(result2);

      // Template 1 should have branch 0
      expect(Object.keys(branchMap1)).toEqual(['0']);

      // Template 2 should have branch 1 (offset by template 1's count)
      expect(Object.keys(branchMap2)).toEqual(['1']);
    });

    it('assigns unique branchIds when templates have multiple branches each', function () {
      const plugin = createTemplateCoveragePlugin({ coverageEnvVar: 'COVERAGE' });
      const moduleName = 'my-app/components/complex';

      const template1 = '{{#if a}}1{{/if}}{{#if b}}2{{else}}3{{/if}}';
      const template2 = '{{#if c}}x{{/if}}';

      const result1 = transformWithPlugin(plugin, template1, moduleName);
      const result2 = transformWithPlugin(plugin, template2, moduleName);

      const branchMap1 = extractBranchMap(result1);
      const branchMap2 = extractBranchMap(result2);

      // Template 1 has branches 0 and 1
      expect(Object.keys(branchMap1).sort()).toEqual(['0', '1']);

      // Template 2 should start at branch 2
      expect(Object.keys(branchMap2)).toEqual(['2']);
    });

    it('does not collide branchIds in coverageMark calls', function () {
      const plugin = createTemplateCoveragePlugin({ coverageEnvVar: 'COVERAGE' });
      const moduleName = 'my-app/components/marks';

      const template1 = '{{#if a}}yes{{/if}}';
      const template2 = '{{#if b}}no{{/if}}';

      const result1 = transformWithPlugin(plugin, template1, moduleName);
      const result2 = transformWithPlugin(plugin, template2, moduleName);

      // Template 1's coverageMark should reference branch 0
      expect(result1).toContain('coverageMark "' + moduleName + '" 0 0');

      // Template 2's coverageMark should reference branch 1 (not 0)
      expect(result2).toContain('coverageMark "' + moduleName + '" 1 0');
    });

    it('does not affect branchIds across different module names', function () {
      const plugin = createTemplateCoveragePlugin({ coverageEnvVar: 'COVERAGE' });

      const template = '{{#if cond}}yes{{/if}}';

      const result1 = transformWithPlugin(plugin, template, 'module-a');
      const result2 = transformWithPlugin(plugin, template, 'module-b');

      const branchMap1 = extractBranchMap(result1);
      const branchMap2 = extractBranchMap(result2);

      // Different modules should each start at 0
      expect(Object.keys(branchMap1)).toEqual(['0']);
      expect(Object.keys(branchMap2)).toEqual(['0']);
    });

    it('handles template with no branches followed by template with branches', function () {
      const plugin = createTemplateCoveragePlugin({ coverageEnvVar: 'COVERAGE' });
      const moduleName = 'my-app/components/mixed';

      const template1 = '<div>hello</div>';
      const template2 = '{{#if cond}}yes{{/if}}';

      const result1 = transformWithPlugin(plugin, template1, moduleName);
      const result2 = transformWithPlugin(plugin, template2, moduleName);

      // Template 1 has no branches — no coverageInit
      expect(result1).not.toContain('coverageInit');

      // Template 2 should still start at branch 0
      const branchMap2 = extractBranchMap(result2);
      expect(Object.keys(branchMap2)).toEqual(['0']);
    });

    it('assigns unique branchIds with inline conditionals across templates', function () {
      const plugin = createTemplateCoveragePlugin({ coverageEnvVar: 'COVERAGE' });
      const moduleName = 'my-app/components/inline';

      const template1 = '<div class={{if a "x" "y"}}></div>';
      const template2 = '<div class={{if b "m" "n"}}></div>';

      const result1 = transformWithPlugin(plugin, template1, moduleName);
      const result2 = transformWithPlugin(plugin, template2, moduleName);

      const branchMap1 = extractBranchMap(result1);
      const branchMap2 = extractBranchMap(result2);

      expect(Object.keys(branchMap1)).toEqual(['0']);
      expect(Object.keys(branchMap2)).toEqual(['1']);

      // coverageCond in template 2 should reference branch 1
      expect(result2).toContain('coverageCond "' + moduleName + '" 1');
    });
  });
});
