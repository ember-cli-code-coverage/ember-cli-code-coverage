import { helper } from '@ember/component/helper';

/**
 * Template helper that registers an Istanbul-compatible coverage object
 * for a template file in window.__coverage__.
 *
 * Injected automatically by the template coverage AST plugin at the root
 * of each template that contains branch points.
 *
 * Usage (injected by AST plugin, not meant for manual use):
 *   {{coverageInit "my-app/templates/application.hbs" "{...branchMapJSON}"}}
 *
 * NOTE: This helper uses constant arguments, so Glimmer's autotracking will
 * only invoke it once per component instance. This is intentional -- we only
 * need to register the coverage map once per template file.
 *
 * Handles .gts files with multiple <template> blocks that share the same
 * module name: subsequent calls merge new branches into the existing entry
 * instead of skipping.
 *
 * @param {string} filePath - the module name / file path of the template
 * @param {string} branchMapJson - JSON-encoded Istanbul branchMap object
 */
export default helper(function coverageInit([filePath, branchMapJson]) {
  if (typeof window === 'undefined') {
    return '';
  }

  // Ensure __coverage__ exists. Istanbul's babel plugin normally creates this,
  // but templates may render before any instrumented JS executes.
  if (!window.__coverage__) {
    window.__coverage__ = {};
  }

  let branchMap;
  try {
    branchMap = JSON.parse(branchMapJson);
  } catch (e) {
    return '';
  }

  // If coverage already exists for this file, merge new branches.
  // This handles .gts files with multiple <template> blocks that share
  // the same module name but have separate branch maps with unique IDs
  // (assigned by the AST plugin's per-module counter).
  if (window.__coverage__[filePath]) {
    let existing = window.__coverage__[filePath];
    if (!window.__templateCoverageStmtMap__) {
      window.__templateCoverageStmtMap__ = {};
    }
    let branchStmtMap = window.__templateCoverageStmtMap__[filePath] || {};
    let stmtKeys = Object.keys(existing.statementMap);
    let stmtId =
      stmtKeys.length > 0 ? Math.max.apply(null, stmtKeys.map(Number)) + 1 : 0;

    let ids = Object.keys(branchMap);
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      // Skip if this branch ID was already registered (e.g., component re-render)
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
    window.__templateCoverageStmtMap__[filePath] = branchStmtMap;
    return '';
  }

  // First template for this file — create the coverage entry.
  // Build Istanbul branch counters and synthetic statement entries.
  // Each branch location gets a corresponding statement so that Istanbul's
  // line/statement coverage metrics reflect whether branch bodies were reached,
  // instead of being vacuously 100% from an empty statementMap.
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
    // Create a synthetic statement for each branch location and record
    // the mapping so coverageMark/coverageCond can increment both b[] and s[].
    for (let j = 0; j < branch.locations.length; j++) {
      branchStmtMap[id + ':' + j] = stmtId;
      statementMap[stmtId] = branch.locations[j];
      s[stmtId] = 0;
      stmtId++;
    }
  }

  // Register Istanbul-compatible coverage object (only standard keys).
  window.__coverage__[filePath] = {
    path: filePath,
    statementMap: statementMap,
    s: s,
    branchMap: branchMap,
    b: b,
    fnMap: {},
    f: {},
  };

  // Store the branch-to-statement mapping separately so it doesn't
  // leak into Istanbul JSON output. coverageMark/coverageCond use this
  // to keep statement counters in sync with branch counters.
  if (!window.__templateCoverageStmtMap__) {
    window.__templateCoverageStmtMap__ = {};
  }
  window.__templateCoverageStmtMap__[filePath] = branchStmtMap;

  return '';
});
