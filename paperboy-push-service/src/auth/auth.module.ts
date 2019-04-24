import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AuthService } from './auth.service';
import { HttpStrategy } from './http.strategy';

@Module({
  imports: [ConfigModule],
  providers: [AuthService, HttpStrategy],
})
export class AuthModule {}
