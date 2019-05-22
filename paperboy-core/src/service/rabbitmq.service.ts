import { connect, Connection, Message } from 'amqplib';
import * as retry from 'retry';
import { logger } from '../logger';
import { QueueService } from './queue.service';

export class RabbitMQService extends QueueService {
  public async listen(): Promise<void> {
    const operation = retry.operation({ forever: true });
    let conn: Connection;
    operation.attempt(
      async () => {
        try {
          conn = await connect(this.options.queue.uri);
          const channel = await conn.createChannel();

          await channel.assertExchange(
            this.options.queue.topic || 'paperboy',
            'fanout',
            {
              durable: false
            }
          );

          const qok = await channel.assertQueue(null, {
            autoDelete: true
          });

          channel.bindQueue(
            qok.queue,
            this.options.queue.topic || 'paperboy',
            ''
          );

          channel.consume(qok.queue, this.consumeMessage.bind(this), {
            noAck: true
          });

          ['error', 'close'].forEach($event =>
            conn.once(
              $event,
              this.retryConnection.bind(this, this.options.queue)
            )
          );
        } catch (error) {
          if (conn) {
            await conn.close();
          }

          if (operation.retry(error)) {
            logger.error(`Could not establish connection to queue: ${error}`);
            return;
          }
        }
      },
      {
        timeout: 10 * 1000,
        callback: async () => {
          if (conn) {
            await conn.close();
          }
        }
      }
    );
  }

  private retryConnection() {
    logger.error(
      'Connection to queue dropped. Will start attempting to reconnect in 5 seconds.'
    );
    setTimeout(this.listen.bind(this), 5000);
  }

  private consumeMessage(message: Message | null) {
    const content = JSON.parse(message.content.toString());
    super.processMessage(content);
  }
}
