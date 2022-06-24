import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { NatsService } from './nats/nats.service';
import { QueueService } from './queue.service';

@Module({
  providers: [
    {
      provide: QueueService,
      useFactory: (configService: ConfigService) =>
        new NatsService(configService),
      inject: [ConfigService],
    },
  ],
  exports: [QueueService],
  imports: [ConfigModule],
})
export class QueueModule {}
