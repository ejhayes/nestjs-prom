import { DEFAULT_PROM_REGISTRY } from "./prom.constants";
import {
  Counter,
  CounterConfiguration,
  GaugeConfiguration,
  Gauge,
  HistogramConfiguration,
  Histogram,
  SummaryConfiguration,
  Summary,
  Registry,
} from 'prom-client';
import { Provider } from "@nestjs/common";
import { getMetricToken, getRegistryToken } from "./common/prom.utils";

export function createPromCounterProvider(
  configuration: CounterConfiguration,
  registryName: string = DEFAULT_PROM_REGISTRY,
): Provider {
  return {
    provide: getMetricToken('Counter', configuration.name),
    useFactory: (registry: Registry) => {
      const obj = new Counter({
        ...configuration,
        registers: [registry]
      });
      return obj;
    },
    inject: [
      getRegistryToken(registryName),
    ],
  };
}

export function createPromGaugeProvider(
  configuration: GaugeConfiguration,
  registryName: string = DEFAULT_PROM_REGISTRY,
): Provider {
  return {
    provide: getMetricToken('Gauge', configuration.name),
    useFactory: (registry: Registry) => {
      const obj = new Gauge({
        ...configuration,
        registers: [registry]
      });
      return obj;
    },
    inject: [
      getRegistryToken(registryName),
    ],
  };
}

export function createPromHistogramProvider(
  configuration: HistogramConfiguration,
  registryName: string = DEFAULT_PROM_REGISTRY,
): Provider {
  return {
    provide: getMetricToken('Histogram', configuration.name),
    useFactory: (registry: Registry) => {
      const obj = new Histogram({
        ...configuration,
        registers: [registry]
      });
      return obj;
    },
    inject: [
      getRegistryToken(registryName),
    ],
  };
}

export function createPromSummaryProvider(
  configuration: SummaryConfiguration,
  registryName: string = DEFAULT_PROM_REGISTRY,
): Provider {
  return {
    provide: getMetricToken('Summary', configuration.name),
    useFactory: (registry: Registry) => {
      const obj = new Summary({
        ...configuration,
        registers: [registry]
      });
      return obj;
    },
    inject: [
      getRegistryToken(registryName),
    ],
  };
}
