/**
 * Records a branch hit in the Istanbul coverage object and increments
 * the corresponding synthetic statement counter for line coverage.
 *
 * Shared by coverageMark and coverageCond helpers to avoid duplication.
 *
 * @param {string} filePath - the template module name / file path
 * @param {number} branchId - the branch index within the file
 * @param {number} locationId - the location index within the branch
 */
export default function recordBranchHit(filePath, branchId, locationId) {
  let coverage = window.__coverage__ && window.__coverage__[filePath];
  if (!coverage || !coverage.b || !coverage.b[branchId]) {
    return;
  }

  coverage.b[branchId][locationId] =
    (coverage.b[branchId][locationId] || 0) + 1;

  // Increment the synthetic statement counter for line coverage.
  // The mapping is stored separately from the Istanbul coverage object
  // to avoid polluting Istanbul JSON output.
  let stmtMap =
    window.__templateCoverageStmtMap__ &&
    window.__templateCoverageStmtMap__[filePath];
  let stmtId = stmtMap && stmtMap[branchId + ':' + locationId];
  if (stmtId !== undefined && coverage.s) {
    coverage.s[stmtId] = (coverage.s[stmtId] || 0) + 1;
  }
}
