import { Client, connect, Msg } from 'ts-nats';
import { logger } from '../logger';
import { QueueService } from './queue.service';

export class NatsService extends QueueService {
  private client: Client;

  public async listen(): Promise<void> {
    this.client = await connect({
      url: this.options.queue.uri,
      maxReconnectAttempts: -1,
      waitOnFirstConnect: true,
      reconnect: true,
    });

    this.client.subscribe(
      this.options.queue.topic || 'paperboy',
      this.consumeMessage.bind(this)
    );
  }

  private consumeMessage(err: Error, message: Msg) {
    if (err) {
      logger.error(`Receiving of a message failed: ${err.message}`);
    } else {
      const data = message.data.toString();
      try {
        const content = JSON.parse(data);
        super.processMessage(content);
      } catch (_err) {
        logger.error(`JSON.parsing failed for message data ${data}`);
        super.processMessage({ source: 'unknown' });
      }
    }
  }
}
