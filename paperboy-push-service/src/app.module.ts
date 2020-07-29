import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    QueueModule,
    HealthModule,
    TerminusModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
