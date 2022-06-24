import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '../config/config.module';
import { HealthController } from './health.controller';
import { NatsHealthIndicator } from './nats.health';
import { QueueHealthIndicator } from './queue.health';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [
    {
      provide: QueueHealthIndicator,
      useFactory: () => new NatsHealthIndicator(),
      inject: [],
    },
  ],
  exports: [QueueHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
