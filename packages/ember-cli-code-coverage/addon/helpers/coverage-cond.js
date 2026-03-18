import { helper } from '@ember/component/helper';
import recordBranchHit from 'ember-cli-code-coverage/utils/record-branch-hit';

/**
 * Template helper that records a branch hit for inline conditionals and
 * returns the condition value as-is (pass-through).
 *
 * Unlike coverageMark which uses constant args (and is thus memoized by
 * Glimmer), this helper receives a tracked condition argument. When the
 * condition changes, Glimmer re-evaluates this helper, correctly recording
 * both true and false branches over the component's lifecycle.
 *
 * Usage (injected by AST plugin, not meant for manual use):
 *   {{if (coverageCond "file" 0 false condition) "yes" "no"}}
 *   {{unless (coverageCond "file" 1 true condition) "no"}}
 *
 * @param {string} filePath - the module name / file path of the template
 * @param {number} branchId - the branch index within the file
 * @param {boolean} reversed - true for {{unless}} (falsy=location 0, truthy=location 1)
 * @param {*} condition - the original condition value (passed through unchanged)
 */
export default helper(function coverageCond([
  filePath,
  branchId,
  reversed,
  condition,
]) {
  if (typeof window === 'undefined') {
    return condition;
  }

  // For `if`: truthy → location 0 (consequent), falsy → location 1 (alternate)
  // For `unless` (reversed): falsy → location 0 (body), truthy → location 1 (skip)
  let locationId = reversed ? (condition ? 1 : 0) : condition ? 0 : 1;
  recordBranchHit(filePath, branchId, locationId);

  return condition;
});
