import { PaperboyOptions } from '../interfaces/paperboy-options.interface';
import { logger } from '../logger';

export abstract class QueueService {
  private buildRunning = false;
  private followingBuild = false;

  constructor(
    protected readonly options: PaperboyOptions,
    private readonly buildFunction: () => Promise<void>
  ) {}

  public abstract listen(): Promise<void>;

  public async processMessage(content: { source: string }) {
    logger.info(`Received message from ${content.source}`);

    if (this.buildRunning) {
      if (!this.followingBuild) {
        this.followingBuild = true;
        logger.info(
          'Queued following build since a build is already in progress'
        );
      }
    } else {
      this.buildRunning = true;
      do {
        this.followingBuild = false;
        await this.buildFunction();
      } while (this.followingBuild);

      this.buildRunning = false;
    }
  }
}
