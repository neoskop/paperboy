import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService, QueueType } from '../config/config.service';
import { NatsService } from './nats/nats.service';
import { QueueService } from './queue.service';
import { RabbitMqService } from './rabbit-mq/rabbit-mq.service';

@Module({
  providers: [
    {
      provide: QueueService,
      useFactory: (configService: ConfigService) =>
        configService.queueType === QueueType.RABBITMQ
          ? new RabbitMqService(configService)
          : new NatsService(configService),
      inject: [ConfigService],
    },
  ],
  exports: [QueueService],
  imports: [ConfigModule],
})
export class QueueModule {}
