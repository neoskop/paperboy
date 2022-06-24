import * as Joi from '@hapi/joi';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export interface EnvConfig {
  [key: string]: string;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
      API_TOKEN: Joi.string().required(),
      TIME_WINDOW: Joi.number().default(60),
      QUEUE_URI: Joi.string().required(),
      QUEUE_EXCHANGE: Joi.string().default('paperboy'),
      QUEUE_SOURCE: Joi.string().default('push-notifier'),
      QUEUE_MESSAGE_EXPIRATION: Joi.number().default(10),
    });

    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get apiToken(): string {
    return this.envConfig.API_TOKEN;
  }

  get timeWindow(): number {
    return Number(this.envConfig.TIME_WINDOW);
  }

  get queueUri(): string {
    return this.envConfig.QUEUE_URI;
  }

  get queueExchange(): string {
    return this.envConfig.QUEUE_EXCHANGE;
  }

  get queueSource(): string {
    return this.envConfig.QUEUE_SOURCE;
  }

  get queueMessageExpiration(): number {
    return Number(this.envConfig.QUEUE_MESSAGE_EXPIRATION);
  }
}
