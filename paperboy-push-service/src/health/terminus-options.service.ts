import { Injectable } from '@nestjs/common';
import {
  TerminusEndpoint,
  TerminusModuleOptions,
  TerminusOptionsFactory,
} from '@nestjs/terminus';
import { ConfigService } from '../config/config.service';
import { QueueHealthIndicator } from './queue.health';

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
  constructor(
    private readonly healthIndicator: QueueHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/health',
      healthIndicators: [
        async () =>
          this.healthIndicator.isHealthy('queue', this.config.queueUri),
      ],
    };
    return {
      endpoints: [healthEndpoint],
    };
  }
}
