import { Logger } from '@nestjs/common';
import { Channel, connect, Connection } from 'amqplib';
import * as retry from 'retry';
import { ConfigService } from '../../config/config.service';
import { QueueService } from '../queue.service';

export class RabbitMqService extends QueueService {
  private connection: Connection;
  private channel: Channel;

  constructor(configService: ConfigService) {
    super(configService);
  }

  protected async publishMessage(message: string): Promise<void> {
    try {
      this.configService.queueExchange
        .split(',')
        .forEach((exchange: string) => {
          this.channel
            .assertExchange(exchange, 'fanout', {
              durable: false,
            })
            .then(() => {
              this.channel.publish(exchange, '', Buffer.from(message), {
                expiration: this.configService.queueMessageExpiration * 1000,
                contentType: 'application/json',
                contentEncoding: 'UTF-8',
                appId: 'paperboy-push-service',
                persistent: false,
              });
            });
        });
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  protected async connectToQueue() {
    const operation = retry.operation({ forever: true });
    operation.attempt(
      async () => {
        try {
          this.connection = await connect(this.configService.queueUri);
          this.channel = await this.connection.createChannel();
          ['error', 'close'].forEach($event =>
            this.connection.once($event, this.retryConnection.bind(this)),
          );
        } catch (error) {
          if (operation.retry(error)) {
            Logger.error(`Could not establish connection to queue: ${error}`);
            return;
          }
        }
      },
      {
        timeout: 10 * 1000,
        callback: () => {
          if (this.connection) {
            this.connection.close();
          }
        },
      },
    );
  }

  private retryConnection() {
    Logger.log(
      'Connection to queue dropped. Will start attempting to reconnect in 5 seconds.',
    );
    setTimeout(this.connectToQueue.bind(this), 5000);
  }
}
