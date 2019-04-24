import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AMQPHealthIndicator } from './amqp.health';
import { TerminusOptionsService } from './terminus-options.service';

@Module({
  imports: [ConfigModule],
  providers: [AMQPHealthIndicator, TerminusOptionsService],
  exports: [AMQPHealthIndicator, TerminusOptionsService],
})
export class HealthModule {}
