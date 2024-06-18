import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '../config/config.module';
import { HealthController } from './health.controller';
import { NatsHealthIndicator } from './nats.health';

@Module({
  imports: [ConfigModule, TerminusModule],
  exports: [NatsHealthIndicator],
  providers: [NatsHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
