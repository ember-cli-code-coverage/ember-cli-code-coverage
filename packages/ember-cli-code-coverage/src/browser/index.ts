import type { CoverageSummaryData } from '../types.js';

declare global {
  var __coverage__: Record<string, unknown> | undefined;
  var __webpack_require__: WebpackRequire | undefined;

  interface Window {
    __coverage__?: Record<string, unknown>;
    requirejs: { entries: Record<string, unknown> };
  }
}

interface WebpackRequire {
  (moduleName: string): unknown;
  m: Record<string, unknown>;
}

type ModuleFilterFn = (type: 'webpack' | 'require', moduleName: string) => boolean;

/**
 * Force evaluation of modules that might not get loaded during the
 * normal flow of your application.
 *
 * Without this, modules that are never `require`d won't appear in the
 * coverage report because Istanbul's instrumentation counters only
 * execute when the module is evaluated.
 *
 * Should be called **after** the test suite completes to reduce
 * side-effects from forced module evaluation.
 *
 * @example
 * ```ts
 * import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/browser';
 *
 * // In your test-helper.ts / setupQUnit hook:
 * QUnit.done(async () => {
 *   forceModulesToBeLoaded();
 *   await sendCoverage();
 * });
 * ```
 */
export function forceModulesToBeLoaded(filterFunction?: ModuleFilterFn): void {
  const filter: ModuleFilterFn =
    filterFunction ??
    ((type, moduleName) => {
      if (type === 'webpack') {
        return !moduleName.startsWith('../') && !moduleName.startsWith('./node_modules/');
      }

      const excludeTestModules = /^[^/]+\/tests\//;
      return !excludeTestModules.test(moduleName);
    });

  // Handle webpack modules (Embroider)
  if (typeof __webpack_require__ !== 'undefined') {
    const __require = __webpack_require__;
    const __modules = __require.m;
    for (const moduleName of Object.keys(__modules)) {
      try {
        if (filter('webpack', moduleName)) {
          __require(moduleName);
        }
      } catch (error) {
        console.warn(
          `Error occurred while evaluating '${moduleName}': ${(error as Error).message}\n${(error as Error).stack}`
        );
      }
    }
  }

  // Handle AMD modules (requirejs)
  if (typeof window !== 'undefined' && window.requirejs) {
    for (const moduleName of Object.keys(window.requirejs.entries)) {
      try {
        if (filter('require', moduleName)) {
          (self as unknown as { require: (m: string) => void }).require(moduleName);
        }
      } catch (error) {
        console.warn(
          `Error occurred while evaluating '${moduleName}': ${(error as Error).message}\n${(error as Error).stack}`
        );
      }
    }
  }
}

/**
 * Send collected coverage data to the server's `/write-coverage`
 * endpoint and display a summary overlay in the browser.
 *
 * @example
 * ```ts
 * import { sendCoverage } from 'ember-cli-code-coverage/browser';
 *
 * // After tests complete:
 * const summary = await sendCoverage();
 * console.log('Coverage:', summary);
 * ```
 */
export async function sendCoverage(): Promise<CoverageSummaryData | undefined> {
  const coverageData = window.__coverage__;

  if (coverageData === undefined) {
    return undefined;
  }

  const body = JSON.stringify(coverageData);

  try {
    const response = await fetch('/write-coverage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      console.error(
        `[ember-cli-code-coverage] Failed to send coverage: ${response.status} ${response.statusText}`
      );
      return undefined;
    }

    const responseData = (await response.json()) as CoverageSummaryData;
    displayCoverageInfo(responseData);
    return responseData;
  } catch (err) {
    console.error('[ember-cli-code-coverage] Error sending coverage:', (err as Error).message);
    return undefined;
  }
}

/**
 * Display coverage summary as an overlay in the browser.
 */
function displayCoverageInfo(data: CoverageSummaryData): void {
  if (!data || typeof document === 'undefined' || !document.body) return;

  const results = ['Lines', 'Branches', 'Functions', 'Statements'].map(
    name => `${name} ${(data[name.toLowerCase()] as { pct: number }).pct}%`
  );

  const resultsText = document.createTextNode(results.join(' | '));
  const element = document.createElement('div');
  element.style.cssText =
    'background-color: white; color: black; border: 2px solid black; padding: 1em; position: fixed; left: 15px; bottom: 15px; z-index: 99999;';
  element.appendChild(resultsText);
  document.body.appendChild(element);
}
