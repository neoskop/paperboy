import { HealthCheckError } from '@godaddy/terminus';
import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { connect } from 'ts-nats';
import { QueueHealthIndicator } from './queue.health';

@Injectable()
export class NatsHealthIndicator extends QueueHealthIndicator {
  constructor() {
    super();
  }

  async isHealthy(
    key: string,
    queueUri: string,
  ): Promise<HealthIndicatorResult> {
    let isHealthy: boolean = false;

    try {
      const client = await connect(queueUri);

      if (client !== null) {
        isHealthy = true;
        client.close();
      }
    } catch (err) {
      // ignored
    }

    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('Health check of NATS server failed', result);
  }
}
