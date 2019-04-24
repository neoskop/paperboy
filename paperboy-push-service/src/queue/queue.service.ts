import { Injectable, Logger } from '@nestjs/common';
import { Channel, connect, Connection } from 'amqplib';
import * as AsyncLock from 'async-lock';
import * as retry from 'retry';
import { ConfigService } from '../config/config.service';

@Injectable()
export class QueueService {
  private connection: Connection;
  private channel: Channel;
  private readonly activeLock: AsyncLock = new AsyncLock({ maxPending: 1 });
  private readonly locks: { [key: string]: AsyncLock };

  constructor(private configService: ConfigService) {
    this.connectToQueue();
  }

  public async notify(
    body: string,
    source: string = this.configService.queueSource,
  ): Promise<void> {
    this.activeLock.acquire(
      source,
      async done => {
        try {
          await this.sendToQueue(body, source);
        } catch (err) {
          Logger.error(`Sending message from ${source} to queue failed.`, err);
        }
        setTimeout(done, this.configService.timeWindow * 1000);
      },
      err => {
        if (err) {
          Logger.log(`Message from ${source} discarded: ${body}`);
        }
      },
    );
  }

  private async sendToQueue(
    body: string,
    source: string = this.configService.queueSource,
  ): Promise<void> {
    let message = {};

    try {
      message = JSON.parse(body);
    } catch (err) {
      Logger.error(`Received invalid JSON: ${body}`);
    }

    message = Object.assign(message, { source });
    Logger.debug(`Publishing message in queue: ${JSON.stringify(message)}`);

    try {
      this.configService.queueExchange
        .split(',')
        .forEach((exchange: string) => {
          this.channel
            .assertExchange(exchange, 'fanout', {
              durable: false,
            })
            .then(() => {
              this.channel.publish(
                exchange,
                '',
                Buffer.from(JSON.stringify(message)),
              );
            });
        });
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private async connectToQueue() {
    const operation = retry.operation({ forever: true });
    operation.attempt(
      async () => {
        try {
          this.connection = await connect(this.configService.queueUri);
          ['error', 'close'].forEach($event =>
            this.connection.on($event, this.retryConnection.bind(this)),
          );
          this.channel = await this.connection.createChannel();
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
    Logger.log('Connection to queue dropped...');
    this.connectToQueue();
  }
}
