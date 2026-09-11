export {
  getConfig,
  isCoverageEnabled,
  DEFAULT_CONFIG,
  BASELINE_RELATIVE_PATH,
} from './config.js';
export { createReport } from './reports.js';
export {
  readJsonBody,
  normalizePathForTemplateImports,
  normalizeEmbroiderPath,
  adjustCoverageKey,
  adjustCoverage,
  writeCoverage,
  seedBaseline,
  reportCoverage,
  coverageHandler,
  buildNamespaceMappings,
} from './coverage.js';
