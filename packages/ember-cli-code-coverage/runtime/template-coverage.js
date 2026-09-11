/* istanbul ignore file -- this is the coverage runtime itself */

/**
 * Browser-side runtime for Glimmer template coverage.
 *
 * The AST plugin emits calls into this module. It builds an
 * Istanbul-shaped coverage object for each instrumented template and
 * records hits as branches are taken.
 *
 * Branch and statement keys are prefixed with `t` so a template's entries
 * can sit alongside JavaScript entries for the same file without either
 * side renumbering the other. Istanbul treats these keys as opaque.
 */

const KEY_PREFIX = 't';

function emptyCoverage(file) {
  return {
    path: file,
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
  };
}

function coverageRoot() {
  if (!window.__coverage__) {
    window.__coverage__ = {};
  }
  return window.__coverage__;
}

function statementRegistry() {
  if (!window.__templateCoverageStatements__) {
    window.__templateCoverageStatements__ = {};
  }
  return window.__templateCoverageStatements__;
}

/**
 * Register a template's branch map, creating its coverage object if the
 * file does not already have one.
 *
 * Called once per template per test run; repeat calls are ignored so
 * counters survive re-renders.
 *
 * @param {string} file - template module name, e.g. `my-app/templates/application.hbs`
 * @param {string} branchMapJson - branch metadata serialized at build time
 */
export function initTemplateCoverage(file, branchMapJson) {
  const registry = statementRegistry();

  if (registry[file]) {
    return;
  }

  let branchMap;
  try {
    branchMap = JSON.parse(branchMapJson);
  } catch {
    return;
  }

  const root = coverageRoot();
  const target = root[file] || (root[file] = emptyCoverage(file));

  // A file may already carry JavaScript coverage; only fill in what is missing.
  target.statementMap = target.statementMap || {};
  target.branchMap = target.branchMap || {};
  target.s = target.s || {};
  target.b = target.b || {};

  const statements = {};

  Object.keys(branchMap)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((id) => {
      const meta = branchMap[id];
      const branchKey = KEY_PREFIX + id;

      target.branchMap[branchKey] = meta;
      target.b[branchKey] = meta.locations.map(() => 0);

      // One synthetic statement per branch path, so the HTML report can
      // highlight template lines rather than only counting branches.
      statements[id] = meta.locations.map((loc, index) => {
        const statementKey = `${branchKey}_${index}`;
        target.statementMap[statementKey] = loc;
        target.s[statementKey] = 0;
        return statementKey;
      });
    });

  registry[file] = statements;
}

/**
 * Record that a branch path was taken.
 *
 * @param {string} file - template module name
 * @param {number} branchId - build-time branch id
 * @param {number} locationId - index of the path taken within that branch
 */
export function recordBranchHit(file, branchId, locationId) {
  const coverage = window.__coverage__ && window.__coverage__[file];
  const branchKey = KEY_PREFIX + branchId;

  if (!coverage || !coverage.b || !coverage.b[branchKey]) {
    return;
  }

  coverage.b[branchKey][locationId] =
    (coverage.b[branchKey][locationId] || 0) + 1;

  const statements = window.__templateCoverageStatements__;
  const statementKey =
    statements && statements[file] && statements[file][branchId]?.[locationId];

  if (statementKey !== undefined) {
    coverage.s[statementKey] = (coverage.s[statementKey] || 0) + 1;
  }
}
