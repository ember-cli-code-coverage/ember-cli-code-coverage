import * as reports from 'istanbul-reports';
import type { ReportBase } from 'istanbul-lib-report';

type ReporterSpec = string | [string, Record<string, unknown>];

/**
 * Create an istanbul report instance.
 * @param reporter - Reporter name or [name, options] tuple
 * @returns Istanbul report instance
 */
export function createReport(reporter: ReporterSpec): ReportBase {
  if (Array.isArray(reporter)) {
    return reports.create(reporter[0] as keyof reports.ReportOptions, reporter[1]) as ReportBase;
  }
  return reports.create(reporter as keyof reports.ReportOptions, {}) as ReportBase;
}
