import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { QueueService } from './queue.service';

@Module({
  providers: [QueueService],
  exports: [QueueService],
  imports: [ConfigModule],
})
export class QueueModule {}
