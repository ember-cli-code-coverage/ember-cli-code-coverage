/* istanbul ignore file -- this is the coverage runtime itself */
import { helper } from '@ember/component/helper';
import { initTemplateCoverage } from '../template-coverage.js';

/**
 * Registers a template's branch map. Rendered at the root of every
 * instrumented template; produces no output.
 */
export default helper(function coverageInit([file, branchMapJson]) {
  initTemplateCoverage(file, branchMapJson);
});
