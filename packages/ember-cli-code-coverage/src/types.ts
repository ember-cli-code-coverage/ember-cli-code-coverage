import type { IncomingMessage } from 'node:http';

/**
 * Coverage configuration for the project.
 */
export interface CoverageConfig {
  /** Name of environment variable to check for coverage enablement */
  coverageEnvVar: string;
  /** Directory in which to write coverage output */
  coverageFolder: string;
  /** List of glob patterns to exclude from coverage */
  excludes: string[];
  /** List of reporters (string or [name, options] tuple) */
  reporters: (string | [string, Record<string, unknown>])[];
  /** Enable parallel coverage merging */
  parallel?: boolean;
  /**
   * Instrument Glimmer templates for branch coverage.
   * Applies to `.hbs` templates; see README for the `.gjs`/`.gts` caveat.
   */
  templateCoverage?: boolean;
  /** Custom hook to modify the asset locations in coverage */
  modifyAssetLocation?: ModifyAssetLocationFn;
}

/**
 * Custom path transformation hook for coverage.
 */
export type ModifyAssetLocationFn = (
  root: string,
  relativePath: string,
  filepath: string,
  namespaceMappings: Map<string, string>,
) => string | undefined | null;

/**
 * Options for building babel coverage plugins.
 */
export interface BuildBabelPluginOptions {
  /**
   * Project root used for resolving config/coverage.js.
   * Note: Istanbul's cwd is always set to '/' internally so that
   * instrumentation works even when the build tool relocates files
   * (e.g. Embroider's Webpack pipeline).
   * @default process.cwd()
   */
  cwd?: string;
  /** Glob patterns to exclude from coverage (use ** prefix for depth-independent matching) */
  exclude?: string[];
  /** File extensions to instrument */
  extension?: string[];
  /** Path to directory containing coverage.js config */
  configPath?: string;
  /** Env var name to check (default: "COVERAGE") */
  coverageEnvVar?: string;
  /**
   * Called once per instrumented file with its zero-filled coverage
   * object. Used to build the Vite baseline; see `coveragePlugin`.
   */
  onCover?: (filename: string, fileCoverage: unknown) => void;
}

/**
 * Options for coverage middleware (testem/vite).
 */
export interface CoverageMiddlewareOptions {
  /** Project root directory (default: process.cwd()) */
  root?: string;
  /** Path to coverage config directory or file */
  configPath?: string;
  /**
   * Module namespace → directory mappings.
   *
   * Omit to derive them from the project's package.json. Pass `null` to
   * disable remapping entirely, which is what Vite builds need: their
   * coverage keys are already absolute filesystem paths.
   */
  namespaceMappings?: Map<string, string> | null;
}

/**
 * Options for the testem middleware factory.
 */
export interface TestemMiddlewareOptions extends CoverageMiddlewareOptions {
  /** Create fresh coverage map per request (default: false) */
  resetOnRequest?: boolean;
  /** Override the build-time coverage baseline path, or `false` to ignore it */
  baselinePath?: string | false;
}

/**
 * Resolved middleware config (with root guaranteed).
 */
export interface ResolvedMiddlewareConfig {
  root: string;
  configPath?: string;
  namespaceMappings?: Map<string, string>;
  /**
   * Path to a zero-filled coverage baseline written at build time.
   * Seeded into the coverage map so files no test imported are still
   * reported, rather than silently missing.
   */
  baselinePath?: string;
}

/**
 * Branch metadata emitted by the template AST plugin at build time and
 * replayed into an Istanbul coverage object in the browser.
 */
export interface TemplateBranchMeta {
  /** Branch kind, mapped onto Istanbul's branch types */
  type: 'if' | 'binary-expr' | 'cond-expr';
  /** Source location of the construct that introduced the branch */
  loc: TemplateSourceRange;
  /** One entry per branch path (consequent, alternate, ...) */
  locations: TemplateSourceRange[];
}

export interface TemplateSourceRange {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

/**
 * Options for the Glimmer template coverage AST plugin.
 */
export interface TemplateCoveragePluginOptions {
  /** Env var name that gates instrumentation (default: "COVERAGE") */
  coverageEnvVar?: string;
  /**
   * Emit camelCase helper references (`coverageMark`) instead of
   * dash-cased ones (`coverage-mark`).
   *
   * Loose-mode `.hbs` templates resolve helpers by name through Ember's
   * classic resolver, which requires the dash-cased form — current
   * `ember-resolver` versions reject a camelCase lookup outright rather
   * than normalizing it. Strict-mode templates (the `<template>` tag in
   * `.gjs`/`.gts`) have no resolver at all: every reference must be an
   * existing JS binding, which is what `templateCoverageImportPlugin`
   * (from `ember-cli-code-coverage/babel`) sets up — and a dash is not
   * a valid identifier character, so that binding has to be camelCase.
   *
   * @default false
   */
  strict?: boolean;
  /**
   * Only instrument templates whose file path starts with this directory
   * (default: `process.cwd()`).
   *
   * A build tool's `transforms` array is not scoped to your own app: a
   * classic v1 addon dependency gets rewritten into a v2-compatible
   * `template()` call as part of Embroider's compat step, and that
   * rewrite runs through the same `transforms`. Without this filter, a
   * dependency's own templates get instrumented too — and since they
   * never went through `templateCoverageImportPlugin`, the injected
   * `coverageInit`/`coverageMark` references have no binding to resolve
   * against, so the build fails outright the moment any dependency needs
   * this kind of rewriting.
   */
  root?: string;
}

/**
 * Options for the Vite coverage plugin.
 */
export interface ViteCoveragePluginOptions extends CoverageMiddlewareOptions {
  /** Enable/disable the plugin (default: checks COVERAGE env var) */
  enabled?: boolean;
  /** File extensions to instrument */
  extension?: string[];
  /** Glob patterns to exclude from instrumentation */
  exclude?: string[];
  /**
   * Emit a zero-filled baseline for every instrumented file so modules
   * no test imports still appear in the report (default: true).
   */
  baseline?: boolean;
}

/**
 * Coverage summary data returned after writing coverage.
 */
export interface CoverageSummaryData {
  lines: { total: number; covered: number; skipped: number; pct: number };
  statements: { total: number; covered: number; skipped: number; pct: number };
  functions: { total: number; covered: number; skipped: number; pct: number };
  branches: { total: number; covered: number; skipped: number; pct: number };
  [key: string]: unknown;
}

/**
 * Coverage data object (from window.__coverage__).
 * Keys are file paths, values are Istanbul file coverage objects.
 */
export type CoverageData = Record<string, unknown>;

/**
 * Express-like application interface (subset used by middleware).
 */
export interface ExpressLikeApp {
  post(
    path: string,
    ...handlers: Array<
      (
        req: IncomingMessage,
        res: ServerResponseLike,
        next: (err?: unknown) => void,
      ) => void
    >
  ): void;
}

/**
 * Minimal server response interface.
 */
export interface ServerResponseLike {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(data?: string): void;
}
