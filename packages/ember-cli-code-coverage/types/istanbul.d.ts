import type { CoverageMap, CoverageMapData } from 'istanbul-lib-coverage';
import type { MapStore } from 'istanbul-lib-source-maps';

export interface CoverageConfig {
  coverageEnvVar: string;
  coverageFolder: string;
  excludes: string[];
  reporters: string[];
  parallel?: boolean;
  templateCoverage?: boolean;
  extension?: string[];
  modifyAssetLocation?: (
    root: string,
    relativePath: string,
    filepath: string,
    namespaceMappings: Map<string, string>
  ) => string | undefined;
}

export interface PathMapping {
  from: string | RegExp;
  to: string;
}

export function loadConfig(configPath: string): CoverageConfig;
export function getDefaultConfig(): CoverageConfig;
export function createCoverageMap(data?: CoverageMapData): CoverageMap;
export function createSourceMapStore(): MapStore;
export function transformCoverageWithSourceMaps(
  coverage: CoverageMap,
  sourceMapStore?: MapStore
): Promise<CoverageMap>;
export function generateReports(
  coverageMap: CoverageMap,
  options: {
    dir: string;
    reporters: (string | [string, object])[];
  }
): void;
export function mergeCoverageMaps(maps: CoverageMap[]): CoverageMap;
export function createReport(reporter: string | [string, object]): any;
export function createCoverageMergeCommand(): {
  name: string;
  description: string;
  run(this: { project: { root: string; configPath: () => string } }): Promise<void>;
};
