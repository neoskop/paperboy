import { NatsConnection, connect } from 'nats';
import { ConfigService } from '../../config/config.service';
import { QueueService } from '../queue.service';

export class NatsService extends QueueService {
  private connection: NatsConnection;
  constructor(configService: ConfigService) {
    super(configService);
  }

  protected async publishMessage(message: string): Promise<void> {
    try {
      const exchanges = this.configService.queueExchange.split(',');

      for (const exchange of exchanges) {
        this.connection.publish(exchange, message);
      }

      return this.connection.flush();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  protected async connectToQueue() {
    this.connection = await connect(
      Object.assign({}, this.configService.queueConnectionsOpts, {
        maxReconnectAttempts: -1,
        waitOnFirstConnect: true,
        reconnect: true,
      }),
    );
  }
}
