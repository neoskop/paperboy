import { HealthCheckError } from '@godaddy/terminus';
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { connect } from 'amqplib';

@Injectable()
export class AMQPHealthIndicator extends HealthIndicator {
  constructor() {
    super();
  }

  async isHealthy(
    key: string,
    queueUri: string,
  ): Promise<HealthIndicatorResult> {
    let isHealthy: boolean = false;

    try {
      const connection = await connect(queueUri);

      if (connection !== null) {
        isHealthy = true;
        connection.close();
      }
    } catch (err) {
      // ignored
    }

    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('Health check of AMQP server failed', result);
  }
}
