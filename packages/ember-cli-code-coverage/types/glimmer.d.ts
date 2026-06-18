export interface GlimmerPluginOptions {
  enabled?: boolean;
  coverageEnvVar?: string;
}

export interface TemplateCoverageData {
  path: string;
  branchMap: Record<string, { type: string; locations: any[]; line: number }>;
  b: Record<string, number[]>;
}

/**
 * Returns a Glimmer AST transform for template branch coverage.
 *
 * NOTE: This is a stub. Template coverage instrumentation is not yet implemented.
 */
export function coverageAstTransform(options?: GlimmerPluginOptions): any[];

/**
 * Register the coverage AST plugin with ember-cli's preprocessor registry.
 *
 * NOTE: This is a stub. Template coverage instrumentation is not yet implemented.
 */
export function setupPreprocessorRegistry(type: string, registry: any): void;
