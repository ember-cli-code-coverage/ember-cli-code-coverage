// Main entry point — re-exports from all modules
export { buildBabelPlugin } from './babel/index.js';
export { coverageMiddleware, serverMiddleware, testMiddleware } from './testem/index.js';
export { coveragePlugin } from './vite/index.js';
export { forceModulesToBeLoaded, sendCoverage } from './browser/index.js';
export { mergeCoverage } from './merge/index.js';
export {
  getConfig,
  isCoverageEnabled,
  DEFAULT_CONFIG,
  createReport,
  readJsonBody,
  adjustCoverageKey,
  adjustCoverage,
  writeCoverage,
  reportCoverage,
  buildNamespaceMappings,
} from './core/index.js';

// Re-export types
export type {
  CoverageConfig,
  BuildBabelPluginOptions,
  CoverageMiddlewareOptions,
  TestemMiddlewareOptions,
  ViteCoveragePluginOptions,
  CoverageSummaryData,
  CoverageData,
  ModifyAssetLocationFn,
} from './types.js';
