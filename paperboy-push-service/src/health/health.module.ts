import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '../config/config.module';
import { ConfigService, QueueType } from '../config/config.service';
import { HealthController } from './health.controller';
import { NatsHealthIndicator } from './nats.health';
import { QueueHealthIndicator } from './queue.health';
import { RabbitMqHealthIndicator } from './rabbit-mq.health';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [
    {
      provide: QueueHealthIndicator,
      useFactory: (configService: ConfigService) =>
        configService.queueType === QueueType.RABBITMQ
          ? new RabbitMqHealthIndicator()
          : new NatsHealthIndicator(),
      inject: [ConfigService],
    },
  ],
  exports: [QueueHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
