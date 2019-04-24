import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  public validateToken(token: string): boolean {
    return this.configService.apiToken === token;
  }
}
