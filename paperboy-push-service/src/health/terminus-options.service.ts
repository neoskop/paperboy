import { Injectable } from '@nestjs/common';
import {
  TerminusEndpoint,
  TerminusModuleOptions,
  TerminusOptionsFactory,
} from '@nestjs/terminus';
import { ConfigService } from '../config/config.service';
import { AMQPHealthIndicator } from './amqp.health';

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
  constructor(
    private readonly amqp: AMQPHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/health',
      healthIndicators: [
        async () => this.amqp.isHealthy('queue', this.config.queueUri),
      ],
    };
    return {
      endpoints: [healthEndpoint],
    };
  }
}
