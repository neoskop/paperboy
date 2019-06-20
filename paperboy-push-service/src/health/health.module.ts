import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '../config/config.module';
import { ConfigService, QueueType } from '../config/config.service';
import { NatsHealthIndicator } from './nats.health';
import { QueueHealthIndicator } from './queue.health';
import { RabbitMqHealthIndicator } from './rabbit-mq.health';
import { TerminusOptionsService } from './terminus-options.service';

@Module({
  imports: [
    ConfigModule,
    TerminusModule.forRootAsync({
      useClass: TerminusOptionsService,
      imports: [HealthModule, ConfigModule],
      inject: [QueueHealthIndicator, ConfigService],
    }),
  ],
  providers: [
    TerminusOptionsService,
    {
      provide: QueueHealthIndicator,
      useFactory: (configService: ConfigService) =>
        configService.queueType === QueueType.RABBITMQ
          ? new RabbitMqHealthIndicator()
          : new NatsHealthIndicator(),
      inject: [ConfigService],
    },
  ],
  exports: [QueueHealthIndicator, TerminusOptionsService],
})
export class HealthModule {}
