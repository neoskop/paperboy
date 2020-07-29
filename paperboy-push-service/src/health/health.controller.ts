import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ConfigService } from '../config/config.service';
import { QueueHealthIndicator } from './queue.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private config: ConfigService,
    private healthIndicator: QueueHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      async () => this.healthIndicator.isHealthy('queue', this.config.queueUri),
    ]);
  }
}
