export { getConfig, isCoverageEnabled, DEFAULT_CONFIG } from './config.js';
export { createReport } from './reports.js';
export {
  readJsonBody,
  normalizePathForTemplateImports,
  normalizeEmbroiderPath,
  adjustCoverageKey,
  adjustCoverage,
  writeCoverage,
  reportCoverage,
  coverageHandler,
  buildNamespaceMappings,
} from './coverage.js';
