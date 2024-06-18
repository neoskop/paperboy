import { HealthCheckError } from '@godaddy/terminus';
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConnectionOptions, connect } from 'nats';

@Injectable()
export class NatsHealthIndicator extends HealthIndicator {
  constructor() {
    super();
  }

  async isHealthy(
    key: string,
    queueConnectionsOpts: ConnectionOptions,
  ): Promise<HealthIndicatorResult> {
    let isHealthy: boolean = false;

    try {
      const client = await connect(queueConnectionsOpts);

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
