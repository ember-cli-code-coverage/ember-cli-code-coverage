/* istanbul ignore file -- this is the coverage runtime itself */
import { helper } from '@ember/component/helper';
import { recordBranchHit } from '../template-coverage.js';

/**
 * Records which side an inline `if`/`unless` selected, then returns the
 * condition untouched so template semantics are unchanged.
 *
 * `reversed` is true for `unless`, where the first branch path is the
 * one taken when the condition is falsy.
 */
export default helper(function coverageCond([file, branchId, reversed, value]) {
  const truthy = Boolean(value);
  recordBranchHit(file, branchId, reversed === truthy ? 1 : 0);
  return value;
});
