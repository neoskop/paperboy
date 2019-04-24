import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AMQPHealthIndicator } from './amqp.health';
import { TerminusOptionsService } from './terminus-options.service';

@Module({
  imports: [
    ConfigModule,
    TerminusModule.forRootAsync({
      useClass: TerminusOptionsService,
      imports: [HealthModule],
      inject: [AMQPHealthIndicator, ConfigService],
    }),
  ],
  providers: [AMQPHealthIndicator, TerminusOptionsService],
  exports: [AMQPHealthIndicator, TerminusOptionsService],
})
export class HealthModule {}
