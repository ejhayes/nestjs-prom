import { ModuleMetadata, Type } from "@nestjs/common/interfaces";

export interface PromModuleOptions {
  [key: string]: any;

  /**
   * Enable default metrics
   * Under the hood, that call collectDefaultMetrics()
   */
  withDefaultsMetrics?: boolean;

  /**
   * Enable internal controller to expose /metrics
   * Caution: If you have a global prefix, don't forget to prefix it in prom
   */
  withDefaultController?: boolean;

  /**
   * Create automatically http_requests_total counter
   */
  useHttpCounterMiddleware?: boolean;

  registryName?: string;
  timeout?: number;
  prefix?: string;
  defaultLabels?: {
    [key: string]: any,
  };

  customUrl?: string;
}

export interface PromModuleOptionsFactory {
  createPromModuleOptions(name?: string): Promise<PromModuleOptions> | PromModuleOptions;
}

export interface PromModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<PromModuleOptions>;
  useClass?: Type<PromModuleOptions>;
  useFactory?: (
    ...args: any[]
  ) => Promise<PromModuleOptions> | PromModuleOptions;
  inject?: any[]
}