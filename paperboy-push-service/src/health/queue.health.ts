import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export abstract class QueueHealthIndicator extends HealthIndicator {
  constructor() {
    super();
  }

  abstract isHealthy(
    key: string,
    queueUri: string,
  ): Promise<HealthIndicatorResult>;
}
