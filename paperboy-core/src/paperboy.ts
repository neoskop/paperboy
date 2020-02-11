import * as retry from 'retry';
import * as shelljs from 'shelljs';
import { PaperboyOptions } from './interfaces/paperboy-options.interface';
import { logger } from './logger';
import { NatsService } from './service/nats.service';
import { QueueService } from './service/queue.service';
import { RabbitMQService } from './service/rabbitmq.service';

export class Paperboy {
  constructor(private readonly options: PaperboyOptions) {}

  public async build(buildCommand?: string): Promise<void> {
    const operation = retry.operation({
      forever: true,
      minTimeout: 1000,
      maxTimeout: 60 * 1000
    });
    await new Promise(done => {
      operation.attempt(async () => {
        try {
          await new Promise((resolve, reject) => {
            const buildProcess = shelljs.exec(
              buildCommand || this.options.command,
              {
                async: true
              }
            );
            buildProcess.on('exit', (code: number) => {
              if (code === 0) {
                resolve();
              } else {
                reject(code);
              }
            });
          });
          done();
        } catch (error) {
          logger.error(`Build process failed with exit code: ${error}`);

          if (operation.retry(error)) {
            logger.warn('Retrying build...');
            return;
          }
        }
      });
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
    await this.build(this.options.initialCommand);

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
