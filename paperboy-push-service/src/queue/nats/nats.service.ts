import { Client, connect } from 'ts-nats';
import { ConfigService } from '../../config/config.service';
import { QueueService } from '../queue.service';

export class NatsService extends QueueService {
  private client: Client;
  constructor(configService: ConfigService) {
    super(configService);
  }

  protected async publishMessage(message: string): Promise<void> {
    try {
      const exchanges = this.configService.queueExchange.split(',');

      for (const exchange of exchanges) {
        this.client.publish(exchange, message);
      }

      return this.client.flush();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  protected async connectToQueue() {
    this.client = await connect({
      url: this.configService.queueUri,
      maxReconnectAttempts: -1,
      waitOnFirstConnect: true,
      reconnect: true,
    });
  }
}
