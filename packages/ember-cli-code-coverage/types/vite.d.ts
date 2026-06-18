import type { Plugin } from 'vite';
import type { CoverageConfig } from './istanbul';

export interface VitePluginOptions {
  /** Enable coverage (defaults to checking COVERAGE env var) */
  enabled?: boolean;
  /** Environment variable to check for enabling coverage (default: "COVERAGE") */
  coverageEnvVar?: string;
  /** Glob patterns to include in instrumentation */
  include?: string[];
  /** Glob patterns to exclude from instrumentation */
  exclude?: string[];
  /** File extensions to instrument */
  extensions?: string[];
  /** Enable template branch coverage (requires /glimmer module) */
  templateCoverage?: boolean;
  /** Coverage config overrides */
  coverage?: Partial<CoverageConfig>;
}

/**
 * Returns an array of Vite plugins for code coverage.
 * Combines instrumentation (transform hook) and coverage server (configureServer hook).
 */
export function coveragePlugin(options?: VitePluginOptions): Plugin[];

/**
 * Vite transform hook for Istanbul instrumentation.
 */
export function instrumentationPlugin(options?: VitePluginOptions): Plugin;

/**
 * Vite dev server middleware for `/write-coverage`.
 */
export function coverageServerPlugin(options?: VitePluginOptions): Plugin;

/**
 * Returns template coverage AST transforms for use in babel.config.cjs.
 * Delegates to the /glimmer module's coverageAstTransform().
 *
 * NOTE: This is currently a stub that returns an empty array.
 */
export function getTemplateCoverageTransforms(): any[];
