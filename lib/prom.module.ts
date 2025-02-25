import { Module, DynamicModule } from '@nestjs/common';
import { PromCoreModule } from './prom-core.module';
import { PromModuleOptions, PromModuleAsyncOptions, MetricType, MetricTypeConfigurationInterface } from './interfaces';
import { createPromCounterProvider, createPromGaugeProvider, createPromHistogramProvider, createPromSummaryProvider } from './prom.providers';
import * as client from 'prom-client';

@Module({})
export class PromModule {

  static forRootAsync(
    options: PromModuleAsyncOptions): DynamicModule {
    return {
      module: PromModule,
      imports: [PromCoreModule.forRootAsync(options)],
      exports: [PromCoreModule],
    };
  }

  static forRoot(
    options: PromModuleOptions = {},
  ): DynamicModule {
    return {
      module: PromModule,
      imports: [PromCoreModule.forRoot(options)],
      exports: [PromCoreModule],
    };
  }

  static forMetrics(
    metrics: MetricTypeConfigurationInterface[],
  ): DynamicModule {

    const providers = metrics.map((entry) => {
      switch (entry.type) {
        case MetricType.Counter:
          return createPromCounterProvider(entry.configuration);
        case MetricType.Gauge:
          return createPromGaugeProvider(entry.configuration);
        case MetricType.Histogram:
          return createPromHistogramProvider(entry.configuration);
        case MetricType.Summary:
          return createPromSummaryProvider(entry.configuration);
        default:
          throw new ReferenceError(`The type ${entry.type} is not supported`);
      }
    });

    return {
      module: PromModule,
      providers: providers,
      exports: providers,
    };
  }

  static forCounter(
    configuration: client.CounterConfiguration,
  ): DynamicModule {
    const provider = createPromCounterProvider(configuration);
    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forGauge(
    configuration: client.GaugeConfiguration,
  ): DynamicModule {
    const provider = createPromGaugeProvider(configuration);
    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forHistogram(
    configuration: client.HistogramConfiguration
  ): DynamicModule {
    const provider = createPromHistogramProvider(configuration);
    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forSummary(
    configuration: client.SummaryConfiguration
  ): DynamicModule {
    const provider = createPromSummaryProvider(configuration);
    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }
}
