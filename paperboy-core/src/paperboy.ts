import * as retry from 'retry';
import * as shelljs from 'shelljs';
import { PaperboyOptions } from './interfaces/paperboy-options.interface';
import { logger } from './logger';
import { NatsService } from './service/nats.service';
import { QueueService } from './service/queue.service';
import { RabbitMQService } from './service/rabbitmq.service';

export class Paperboy {
  constructor(private readonly options: PaperboyOptions) {}

  public async build(): Promise<void> {
    const operation = retry.operation({ forever: true });
    await operation.attempt(async () => {
      try {
        return new Promise((resolve, reject) => {
          const returnValue = shelljs.exec(this.options.command);

          if (returnValue.code === 0) {
            resolve(returnValue);
          } else {
            reject(returnValue.code);
          }
        });
      } catch (error) {
        logger.error(`Build process failed with exit code: ${error}`);

        if (operation.retry(error)) {
          logger.warn('Retrying build...');
          return;
        }
      }
    });
  }

  public async start(): Promise<void> {
    if (
      this.options.queue === undefined ||
      this.options.queue.uri === undefined
    ) {
      throw new Error(
        'You need to configure the queue when running paperboy start'
      );
    }

    // initial generation
    await this.build();

    // Execute readiness hook if set
    if (this.options.readinessHook && 0 !== this.options.readinessHook.length) {
      shelljs.exec(this.options.readinessHook);
    }

    // Start listening to queue
    let queueService: QueueService;

    if (this.options.queue.uri.startsWith('nats')) {
      queueService = new NatsService(this.options, this.build.bind(this));
    } else if (this.options.queue.uri.startsWith('amqp')) {
      queueService = new RabbitMQService(this.options, this.build.bind(this));
    } else {
      throw new Error(
        `Unknown protocol in queue URI ${this.options.queue.uri}`
      );
    }

    queueService.listen();
  }
}
