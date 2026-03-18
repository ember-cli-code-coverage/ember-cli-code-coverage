import { helper } from '@ember/component/helper';
import recordBranchHit from 'ember-cli-code-coverage/utils/record-branch-hit';

/**
 * Template helper that increments an Istanbul branch coverage counter
 * and its corresponding synthetic statement counter.
 *
 * Injected automatically by the template coverage AST plugin at the
 * beginning of each branch body (if/else, unless, each with else,
 * curly/angle-bracket component default blocks).
 *
 * Usage (injected by AST plugin, not meant for manual use):
 *   {{coverageMark "my-app/templates/application.hbs" 0 1}}
 *
 * NOTE: This helper uses constant arguments, so Glimmer's autotracking will
 * only invoke it once per component instance. For block-level branch coverage,
 * a single invocation is sufficient to record that the branch was taken.
 *
 * @param {string} filePath - the module name / file path of the template
 * @param {number} branchId - the branch index within the file
 * @param {number} locationId - the location index within the branch (0=consequent, 1=alternate)
 */
export default helper(function coverageMark([filePath, branchId, locationId]) {
  if (typeof window === 'undefined') {
    return '';
  }

  recordBranchHit(filePath, branchId, locationId);

  return '';
});
