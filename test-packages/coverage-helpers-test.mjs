import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Tests for the runtime coverage helpers' logic.
 *
 * Since the actual helpers depend on @ember/component/helper, we test
 * the equivalent logic directly by simulating what coverageInit,
 * coverageMark, and coverageCond do to window.__coverage__.
 */

// Simulate the core logic of coverageInit (without the Ember helper wrapper)
function coverageInit(globalObj, filePath, branchMapJson) {
  if (!globalObj.__coverage__) {
    globalObj.__coverage__ = {};
  }

  let branchMap;
  try {
    branchMap = JSON.parse(branchMapJson);
  } catch (e) {
    return;
  }

  // Merge into existing entry (handles multiple <template> blocks per file)
  if (globalObj.__coverage__[filePath]) {
    let existing = globalObj.__coverage__[filePath];
    if (!globalObj.__templateCoverageStmtMap__) {
      globalObj.__templateCoverageStmtMap__ = {};
    }
    let branchStmtMap = globalObj.__templateCoverageStmtMap__[filePath] || {};
    let stmtKeys = Object.keys(existing.statementMap);
    let stmtId = stmtKeys.length > 0
      ? Math.max.apply(null, stmtKeys.map(Number)) + 1
      : 0;

    let ids = Object.keys(branchMap);
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      if (existing.branchMap[id]) {
        continue;
      }
      let branch = branchMap[id];
      existing.branchMap[id] = branch;
      existing.b[id] = branch.locations.map(function () {
        return 0;
      });
      for (let j = 0; j < branch.locations.length; j++) {
        branchStmtMap[id + ':' + j] = stmtId;
        existing.statementMap[stmtId] = branch.locations[j];
        existing.s[stmtId] = 0;
        stmtId++;
      }
    }
    globalObj.__templateCoverageStmtMap__[filePath] = branchStmtMap;
    return;
  }

  // First template — create entry
  let b = {};
  let statementMap = {};
  let s = {};
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

  globalObj.__coverage__[filePath] = {
    path: filePath,
    statementMap: statementMap,
    s: s,
    branchMap: branchMap,
    b: b,
    fnMap: {},
    f: {},
  };

  if (!globalObj.__templateCoverageStmtMap__) {
    globalObj.__templateCoverageStmtMap__ = {};
  }
  globalObj.__templateCoverageStmtMap__[filePath] = branchStmtMap;
}

// Simulate recordBranchHit
function recordBranchHit(globalObj, filePath, branchId, locationId) {
  let coverage = globalObj.__coverage__ && globalObj.__coverage__[filePath];
  if (!coverage || !coverage.b || !coverage.b[branchId]) {
    return;
  }

  coverage.b[branchId][locationId] =
    (coverage.b[branchId][locationId] || 0) + 1;

  let stmtMap =
    globalObj.__templateCoverageStmtMap__ &&
    globalObj.__templateCoverageStmtMap__[filePath];
  let stmtKey = stmtMap && stmtMap[branchId + ':' + locationId];
  if (stmtKey !== undefined && coverage.s) {
    coverage.s[stmtKey] = (coverage.s[stmtKey] || 0) + 1;
  }
}

function loc(line, col) {
  return { start: { line, column: col }, end: { line, column: col + 5 } };
}

describe('coverage-init merge behavior', function () {
  let globalObj;

  beforeEach(function () {
    globalObj = {};
  });

  it('creates a new coverage entry for the first template', function () {
    const branchMap = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };

    coverageInit(globalObj, 'my-file.hbs', JSON.stringify(branchMap));

    const coverage = globalObj.__coverage__['my-file.hbs'];
    expect(coverage).toBeTruthy();
    expect(coverage.path).toBe('my-file.hbs');
    expect(coverage.branchMap).toHaveProperty('0');
    expect(coverage.b['0']).toEqual([0, 0]);
    expect(Object.keys(coverage.statementMap)).toHaveLength(2);
    expect(coverage.s[0]).toBe(0);
    expect(coverage.s[1]).toBe(0);
  });

  it('merges branches from second template into existing entry', function () {
    const branchMap1 = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };
    const branchMap2 = {
      '1': { type: 'if', locations: [loc(5, 0), loc(5, 10)], loc: loc(5, 0) },
    };

    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap1));
    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap2));

    const coverage = globalObj.__coverage__['my-file.gts'];

    // Should have both branches
    expect(coverage.branchMap).toHaveProperty('0');
    expect(coverage.branchMap).toHaveProperty('1');
    expect(coverage.b['0']).toEqual([0, 0]);
    expect(coverage.b['1']).toEqual([0, 0]);

    // Should have 4 synthetic statements (2 per branch)
    expect(Object.keys(coverage.statementMap)).toHaveLength(4);
  });

  it('does not duplicate branches on re-render (same branchIds)', function () {
    const branchMap = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };

    coverageInit(globalObj, 'my-file.hbs', JSON.stringify(branchMap));
    coverageInit(globalObj, 'my-file.hbs', JSON.stringify(branchMap));

    const coverage = globalObj.__coverage__['my-file.hbs'];
    expect(Object.keys(coverage.branchMap)).toEqual(['0']);
    expect(Object.keys(coverage.statementMap)).toHaveLength(2);
  });

  it('merges three templates correctly', function () {
    const branchMap1 = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };
    const branchMap2 = {
      '1': { type: 'if', locations: [loc(5, 0), loc(5, 10)], loc: loc(5, 0) },
      '2': { type: 'cond', locations: [loc(6, 0), loc(6, 10)], loc: loc(6, 0) },
    };
    const branchMap3 = {
      '3': { type: 'if', locations: [loc(10, 0), loc(10, 10)], loc: loc(10, 0) },
    };

    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap1));
    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap2));
    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap3));

    const coverage = globalObj.__coverage__['my-file.gts'];
    expect(Object.keys(coverage.branchMap).sort()).toEqual(['0', '1', '2', '3']);
    expect(Object.keys(coverage.b).sort()).toEqual(['0', '1', '2', '3']);
    // 4 branches × 2 locations each = 8 statements
    expect(Object.keys(coverage.statementMap)).toHaveLength(8);
  });

  it('statement map IDs do not collide after merge', function () {
    const branchMap1 = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };
    const branchMap2 = {
      '1': { type: 'if', locations: [loc(5, 0), loc(5, 10)], loc: loc(5, 0) },
    };

    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap1));
    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap2));

    const stmtMap = globalObj.__templateCoverageStmtMap__['my-file.gts'];

    // Branch 0 locations map to statements 0, 1
    expect(stmtMap['0:0']).toBe(0);
    expect(stmtMap['0:1']).toBe(1);

    // Branch 1 locations map to statements 2, 3 (no collision)
    expect(stmtMap['1:0']).toBe(2);
    expect(stmtMap['1:1']).toBe(3);
  });
});

describe('recordBranchHit with merged coverage', function () {
  let globalObj;

  beforeEach(function () {
    globalObj = {};
  });

  it('records hits for branches from both templates', function () {
    const branchMap1 = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };
    const branchMap2 = {
      '1': { type: 'if', locations: [loc(5, 0), loc(5, 10)], loc: loc(5, 0) },
    };

    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap1));
    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap2));

    // Hit branch 0 (from template 1)
    recordBranchHit(globalObj, 'my-file.gts', 0, 0);
    // Hit branch 1 (from template 2)
    recordBranchHit(globalObj, 'my-file.gts', 1, 1);

    const coverage = globalObj.__coverage__['my-file.gts'];
    expect(coverage.b['0']).toEqual([1, 0]);
    expect(coverage.b['1']).toEqual([0, 1]);
  });

  it('updates synthetic statements for merged branches', function () {
    const branchMap1 = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };
    const branchMap2 = {
      '1': { type: 'if', locations: [loc(5, 0), loc(5, 10)], loc: loc(5, 0) },
    };

    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap1));
    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap2));

    recordBranchHit(globalObj, 'my-file.gts', 1, 0);

    const coverage = globalObj.__coverage__['my-file.gts'];
    // Statement 2 corresponds to branch 1, location 0
    expect(coverage.s[2]).toBe(1);
    // Other statements unchanged
    expect(coverage.s[0]).toBe(0);
    expect(coverage.s[1]).toBe(0);
    expect(coverage.s[3]).toBe(0);
  });

  it('does not crash when hitting a non-existent branch', function () {
    const branchMap1 = {
      '0': { type: 'if', locations: [loc(1, 0), loc(1, 10)], loc: loc(1, 0) },
    };

    coverageInit(globalObj, 'my-file.gts', JSON.stringify(branchMap1));

    // Branch 99 doesn't exist — should silently no-op
    recordBranchHit(globalObj, 'my-file.gts', 99, 0);

    const coverage = globalObj.__coverage__['my-file.gts'];
    expect(coverage.b['0']).toEqual([0, 0]);
  });
});
