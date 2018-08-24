import { SourceOptions } from './source-options.interface';

export declare type SourceCallback = () => Promise<void>;

export abstract class Source {
  public generate: () => Promise<void>;
  public start: () => Promise<void>;

  constructor(options: SourceOptions, callback: SourceCallback) {}
}
