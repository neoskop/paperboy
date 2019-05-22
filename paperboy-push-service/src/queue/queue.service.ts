import { Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

export abstract class QueueService {
  private readonly locks: { [key: string]: { pendingMessage?: string } } = {};

  constructor(protected readonly configService: ConfigService) {
    this.connectToQueue();
  }

  public async notify(
    body: string,
    source: string = this.configService.queueSource,
  ): Promise<void> {
    const message = this.getMessageJson(body, source);

    if (source in this.locks) {
      if (this.locks[source].pendingMessage) {
        Logger.log(`Message from ${source} discarded: ${body}`);
      } else {
        this.locks[source].pendingMessage = message;
        Logger.log(
          `The following message from ${source} will be sent in ${
            this.configService.timeWindow
          } seconds: ${body}`,
        );
      }

      return Promise.resolve();
    }

    this.locks[source] = {};
    Logger.debug(`Publishing message in queue: ${message}`);

    try {
      this.publishMessage(message);
      setTimeout(() => {
        const pendingMessage = this.locks[source].pendingMessage;

        if (pendingMessage) {
          Logger.debug(
            `Publishing delayed message in queue: ${
              this.locks[source].pendingMessage
            }`,
          );
          this.publishMessage(this.locks[source].pendingMessage);
        }

        delete this.locks[source];
      }, this.configService.timeWindow * 1000);
      return Promise.resolve();
    } catch (err) {
      Logger.error(`Sending message from ${source} to queue failed.`, err);
      return Promise.reject(err);
    }
  }

  protected abstract async publishMessage(message: string): Promise<void>;

  protected abstract async connectToQueue(): Promise<void>;

  protected getMessageJson(body: string, source: string): string {
    let message = {};

    try {
      message = JSON.parse(body);
    } catch (err) {
      Logger.error(`Received invalid JSON: ${body}`);
    }

    message = Object.assign(message, { source });
    return JSON.stringify(message);
  }
}
