/* istanbul ignore file -- this is the coverage runtime itself */
import { helper } from '@ember/component/helper';
import { recordBranchHit } from '../template-coverage.js';

/**
 * Records a block branch hit. Rendered at the start of each branch body;
 * produces no output.
 */
export default helper(function coverageMark([file, branchId, locationId]) {
  recordBranchHit(file, branchId, locationId);
});
