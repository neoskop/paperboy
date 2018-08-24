import { SinkOptions } from './sink-options.interface';
import { SourceOptions } from './source-options.interface';

export interface PaperboyOptions {
  readinessHook?: string;
  source: SourceOptions;
  sink: SinkOptions;
}
