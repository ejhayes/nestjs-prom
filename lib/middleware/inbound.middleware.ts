import { Injectable, NestMiddleware, Inject } from "@nestjs/common";
import { Counter, Registry } from "prom-client";
import { InjectCounterMetric } from "../common";
import { PROM_OPTIONS, METRIC_HTTP_REQUESTS_TOTAL, DEFAULT_METRICS_ENDPOINT, PROM_REGISTRY } from "../prom.constants";
import { PromModuleOptions } from "../interfaces";

@Injectable()
export class InboundMiddleware implements NestMiddleware {

  constructor(
    @Inject(PROM_OPTIONS) private readonly _options: PromModuleOptions,
    @Inject(PROM_REGISTRY) private readonly _registry: Registry,
    @InjectCounterMetric(METRIC_HTTP_REQUESTS_TOTAL) private readonly _counter: Counter,
  ) {}

  use (req, res, next) {
    if ( !this._options.useHttpCounterMiddleware ) {
      next();
      return;
    }

    const url: string = req.baseUrl;
    const method: string = req.method;

    // ignore favicon
    if (url == '/favicon.ico') {
      next();
      return ;
    }

    // ignore metrics, return them if requested
    if (url.match(`^\/${this._options.customUrl || DEFAULT_METRICS_ENDPOINT}$`)) {
      res.set('Content-Type', this._registry.contentType);
      res.end(this._registry.metrics());
      return ;
    }

    const labelValues = {
      method,
      status: res.statusCode,
      path: url,
    };

    this._counter.inc(labelValues, 1, new Date());

    next();
  }
}
