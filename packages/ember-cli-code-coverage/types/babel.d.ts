export interface BabelPluginOptions {
  cwd?: string;
  exclude?: string[];
  extensions?: string[];
  coverageEnvVar?: string;
  configPath?: string;
  embroider?: boolean;
  /**
   * When true, skips the GJS/GTS ignore plugin since templates
   * will be instrumented by the /glimmer module instead.
   */
  templateCoverage?: boolean;
}

export function buildBabelPlugin(opts?: BabelPluginOptions): any[];
export function createIstanbulPlugin(options: {
  cwd: string;
  include: string;
  exclude: string[];
  extension: string[];
}): [string, object];
export function createGjsGtsIgnorePlugin(): string;
