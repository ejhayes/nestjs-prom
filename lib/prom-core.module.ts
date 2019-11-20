import {
  Global,
  DynamicModule,
  Module,
  Provider,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PromModuleOptions, PromModuleAsyncOptions, PromModuleOptionsFactory } from './interfaces';
import { DEFAULT_PROM_REGISTRY, PROM_REGISTRY_NAME, PROM_OPTIONS, PROM_REGISTRY, METRIC_HTTP_REQUESTS_TOTAL } from './prom.constants';

import * as client from 'prom-client';
import { Registry, collectDefaultMetrics, DefaultMetricsCollectorConfiguration } from 'prom-client';
import { getRegistryName } from './common/prom.utils';
import { createPromCounterProvider } from './prom.providers';

@Global()
@Module({})
export class PromCoreModule {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRootAsync(
    options: PromModuleAsyncOptions = {},
  ): DynamicModule {
    let promRegistryOptionsProvider: Provider;
    
    if (options.useFactory) {      
      promRegistryOptionsProvider = {
        provide: PROM_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    } else {
      promRegistryOptionsProvider = {
        provide: PROM_OPTIONS,
        useFactory: async (optionsFactory: PromModuleOptionsFactory) => {
          await optionsFactory.createPromModuleOptions(options.name);
        },
        inject: [options.useClass || options.useExisting]
      }
    }

    const promRegistryNameProvider = {
      provide: PROM_REGISTRY_NAME,
      useFactory: async (promModuleOptions: PromModuleOptions) => {
        return getRegistryName(promModuleOptions.registryName)
      },
      inject: [PROM_OPTIONS]
    };

    const registryProvider: Provider = {
      provide: PROM_REGISTRY,
      useFactory: (promModuleOptions: PromModuleOptions): Registry => {

        let registry = client.register;
        if (promModuleOptions.registryName !== DEFAULT_PROM_REGISTRY) {
          registry = new Registry();
        }

        if (promModuleOptions.withDefaultsMetrics !== false) {
          const defaultMetricsOptions: DefaultMetricsCollectorConfiguration = {
            register: registry,
          };
          if (promModuleOptions.timeout) {
            defaultMetricsOptions.timeout = promModuleOptions.timeout;
          }
          if (promModuleOptions.prefix) {
            defaultMetricsOptions.prefix = promModuleOptions.prefix;
          }
          collectDefaultMetrics(defaultMetricsOptions);
        }

        return registry;
      },
      inject: [PROM_OPTIONS],
    }

    const inboundProvider = createPromCounterProvider({
      name: METRIC_HTTP_REQUESTS_TOTAL,
      help: 'http_requests_total Number of inbound request',
      labelNames: ['method', 'status', 'path']
    });

    return {
      module: PromCoreModule,
      providers: [
        promRegistryNameProvider,
        promRegistryOptionsProvider,
        registryProvider,
        inboundProvider,
      ],
      exports: [
        registryProvider,
        inboundProvider,
      ],
    };
  }

  static forRoot(
    options: PromModuleOptions = {},
  ): DynamicModule {

    const {
      withDefaultsMetrics,
      registryName,
      timeout,
      prefix,
      ...promOptions
    } = options;

    const promRegistryName = registryName ?
      getRegistryName(registryName)
      : DEFAULT_PROM_REGISTRY;

    const promRegistryNameProvider = {
      provide: PROM_REGISTRY_NAME,
      useValue: promRegistryName,
    }

    const promRegistryOptionsProvider = {
      provide: PROM_OPTIONS,
      useValue: options,
    }

    const registryProvider = {
      provide: PROM_REGISTRY,
      useFactory: (): Registry => {

        let registry = client.register;
        if (promRegistryName !== DEFAULT_PROM_REGISTRY) {
          registry = new Registry();
        }

        if (withDefaultsMetrics !== false) {
          const defaultMetricsOptions: DefaultMetricsCollectorConfiguration = {
            register: registry,
          };
          if (timeout) {
            defaultMetricsOptions.timeout = timeout;
          }
          if (prefix) {
            defaultMetricsOptions.prefix = prefix;
          }
          collectDefaultMetrics(defaultMetricsOptions);
        }

        return registry;
      },

    }

    const inboundProvider = createPromCounterProvider({
      name: METRIC_HTTP_REQUESTS_TOTAL,
      help: 'http_requests_total Number of inbound request',
      labelNames: ['method', 'status', 'path']
    });

    return {
      module: PromCoreModule,
      providers: [
        promRegistryNameProvider,
        promRegistryOptionsProvider,
        registryProvider,
        inboundProvider,
      ],
      exports: [
        registryProvider,
        inboundProvider,
      ],
    };
  }

  /**
   * on destroy
   */
  onModuleDestroy() {
  }
}