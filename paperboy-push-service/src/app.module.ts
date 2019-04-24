import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { QueueModule } from './queue/queue.module';
import { TerminusOptionsServiceService } from './terminus-options-service/terminus-options-service.service';

@Module({
  imports: [AuthModule, ConfigModule, QueueModule],
  controllers: [AppController],
  providers: [TerminusOptionsServiceService],
})
export class AppModule {}
