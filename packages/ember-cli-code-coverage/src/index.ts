// Main entry point — re-exports from all modules
export { buildBabelPlugin } from './babel/index.js';
export {
  coverageMiddleware,
  viteTestemMiddleware,
  serverMiddleware,
  testMiddleware,
} from './testem/index.js';
export {
  coveragePlugin,
  instrumentationPlugin,
  coverageServerPlugin,
} from './vite/index.js';
export { createTemplateCoveragePlugin } from './glimmer/index.js';
export { forceModulesToBeLoaded, sendCoverage } from './browser/index.js';
export { mergeCoverage } from './merge/index.js';
export {
  getConfig,
  isCoverageEnabled,
  DEFAULT_CONFIG,
  BASELINE_RELATIVE_PATH,
  createReport,
  readJsonBody,
  adjustCoverageKey,
  adjustCoverage,
  writeCoverage,
  seedBaseline,
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
  TemplateCoveragePluginOptions,
  TemplateBranchMeta,
  TemplateSourceRange,
  CoverageSummaryData,
  CoverageData,
  ModifyAssetLocationFn,
} from './types.js';
