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
    let isHealthy: boolean;

    try {
      const connection = await connect(queueUri);
      isHealthy = connection !== null;
      connection.close();
    } catch (err) {
      isHealthy = false;
    }

    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('Health check of AMQP server failed', result);
  }
}
