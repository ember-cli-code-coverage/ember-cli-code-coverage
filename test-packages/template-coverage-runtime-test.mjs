import { describe, it, expect, beforeEach } from 'vitest';
import {
  initTemplateCoverage,
  recordBranchHit,
} from '../packages/ember-cli-code-coverage/runtime/template-coverage.js';

const FILE = 'my-app/templates/application.hbs';

const LOC = (line, column) => ({
  start: { line, column },
  end: { line, column: column + 1 },
});

/** A two-path conditional, the shape the AST plugin emits. */
const BRANCH_MAP = JSON.stringify({
  0: { type: 'if', loc: LOC(1, 0), locations: [LOC(1, 17), LOC(1, 25)] },
});

describe('template coverage runtime', function () {
  beforeEach(function () {
    globalThis.window = {};
  });

  it('registers an Istanbul-shaped coverage object for the template', function () {
    initTemplateCoverage(FILE, BRANCH_MAP);

    const coverage = window.__coverage__[FILE];

    expect(coverage.path).toBe(FILE);
    expect(Object.keys(coverage.branchMap)).toEqual(['t0']);
    expect(coverage.b.t0).toEqual([0, 0]);
    // One synthetic statement per branch path, so lines can be highlighted.
    expect(Object.keys(coverage.statementMap)).toEqual(['t0_0', 't0_1']);
    expect(coverage.s).toEqual({ t0_0: 0, t0_1: 0 });
    expect(coverage.fnMap).toEqual({});
  });

  it('counts a branch hit against both the branch and its statement', function () {
    initTemplateCoverage(FILE, BRANCH_MAP);
    recordBranchHit(FILE, 0, 1);
    recordBranchHit(FILE, 0, 1);

    const coverage = window.__coverage__[FILE];

    expect(coverage.b.t0).toEqual([0, 2]);
    expect(coverage.s).toEqual({ t0_0: 0, t0_1: 2 });
  });

  it('keeps counters across re-renders of the same template', function () {
    initTemplateCoverage(FILE, BRANCH_MAP);
    recordBranchHit(FILE, 0, 0);
    initTemplateCoverage(FILE, BRANCH_MAP);

    expect(window.__coverage__[FILE].b.t0).toEqual([1, 0]);
  });

  it('adds to JavaScript coverage for the same file without renumbering it', function () {
    window.__coverage__ = {
      [FILE]: {
        path: FILE,
        statementMap: { 0: LOC(1, 0) },
        fnMap: {},
        branchMap: {
          0: { type: 'if', loc: LOC(1, 0), locations: [LOC(1, 0)] },
        },
        s: { 0: 3 },
        f: {},
        b: { 0: [3] },
      },
    };

    initTemplateCoverage(FILE, BRANCH_MAP);
    recordBranchHit(FILE, 0, 0);

    const coverage = window.__coverage__[FILE];

    // The existing numeric entries are untouched; template keys sit beside them.
    expect(coverage.b[0]).toEqual([3]);
    expect(coverage.s[0]).toBe(3);
    expect(coverage.b.t0).toEqual([1, 0]);
  });

  it('ignores hits for templates it never registered', function () {
    expect(() => recordBranchHit('never/seen.hbs', 0, 0)).not.toThrow();
    expect(window.__coverage__).toBeUndefined();
  });

  it('ignores hits for branches outside the registered map', function () {
    initTemplateCoverage(FILE, BRANCH_MAP);

    expect(() => recordBranchHit(FILE, 99, 0)).not.toThrow();
    expect(window.__coverage__[FILE].b.t0).toEqual([0, 0]);
  });

  it('ignores a branch map it cannot parse', function () {
    expect(() => initTemplateCoverage(FILE, 'not json')).not.toThrow();
    expect(window.__coverage__).toBeUndefined();
  });
});
