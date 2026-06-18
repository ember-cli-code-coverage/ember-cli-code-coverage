export type ModuleFilter = (
  loaderType: 'webpack' | 'require',
  moduleName: string
) => boolean;

export interface CoverageResponse {
  lines?: { pct: number };
  branches?: { pct: number };
  functions?: { pct: number };
  statements?: { pct: number };
}

/**
 * Forces evaluation of all registered modules.
 * This ensures modules that aren't imported during tests still appear in coverage reports.
 */
export function forceModulesToBeLoaded(filterFunction?: ModuleFilter): void;

/**
 * POSTs `window.__coverage__` to `/write-coverage`.
 */
export function sendCoverage(
  callback?: () => void
): Promise<CoverageResponse | undefined>;
