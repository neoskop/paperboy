export interface PaperboyOptions {
  /** An arbitrary command to execute once the initial execution succeeded */
  readinessHook?: string;

  /** The command to execute to build the frontend */
  command: string;

  /** The configuration of the queue to which Paperboy listens */
  queue?: {
    uri: string;
    topic?: string;
  };
}
