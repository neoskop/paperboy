import { ChildProcess } from 'child_process';
import * as shelljs from 'shelljs';
import { SinkOptions } from './interfaces/sink-options.interface';
import { ExecOutputReturnValue } from 'shelljs';

export class Sink {
  private asyncProcess: ChildProcess;
  private options: SinkOptions;

  constructor(options: SinkOptions) {
    this.options = Object.assign({
      workDir: '.'
    }, options);
  }

  public build(): Promise<ExecOutputReturnValue> {
    return new Promise((resolve, reject) => {
      shelljs.cd(this.options.workDir);

      if (this.options.async) {
        if (!this.asyncProcess || this.options.restartOnChange) {
          this.spawnProcessAsync();
          ['error', 'exit', 'close'].forEach(e => this.asyncProcess.on(e, this.spawnProcessAsync.bind(this)));
        }

        resolve();
      } else {
        const returnValue = shelljs.exec(this.options.command);

        if (returnValue.code === 0) {
          resolve(returnValue);
        } else {
          reject(returnValue.code);
        }
      }
    });
  }

  private spawnProcessAsync() {
    this.asyncProcess = <ChildProcess>shelljs.exec(this.options.command, {async: true});
  }
}
