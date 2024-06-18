import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ConfigService } from '../config/config.service';
import { NatsHealthIndicator } from './nats.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private config: ConfigService,
    private healthIndicator: NatsHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      async () =>
        this.healthIndicator.isHealthy(
          'queue',
          this.config.queueConnectionsOpts,
        ),
    ]);
  }
}
