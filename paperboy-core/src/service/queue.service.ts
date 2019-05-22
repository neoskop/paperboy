import AsyncLock = require('async-lock');
import { PaperboyOptions } from '../interfaces/paperboy-options.interface';
import { logger } from '../logger';

export abstract class QueueService {
  private readonly generationLock: AsyncLock = new AsyncLock({ maxPending: 1 });

  constructor(
    protected readonly options: PaperboyOptions,
    private readonly buildFunction: () => void
  ) {}

  public abstract async listen(): Promise<void>;

  protected processMessage(content: { source: string }) {
    logger.info(`Received message from ${content.source}`);

    this.generationLock.acquire(
      'generationLock',
      async done => {
        try {
          await this.buildFunction();
        } catch (err) {
          logger.error('Generation failed.', err);
        }

        done();
      },
      err => {
        if (err) {
          logger.info('Already another pending message. Message discarded!');
        }
      }
    );
  }
}
