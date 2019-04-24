import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AMQPHealthIndicator } from './health/amqp.health';
import { HealthModule } from './health/health.module';
import { TerminusOptionsService } from './health/terminus-options.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    QueueModule,
    TerminusModule.forRootAsync({
      useClass: TerminusOptionsService,
      imports: [HealthModule],
      inject: [AMQPHealthIndicator, ConfigService],
    }),
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
