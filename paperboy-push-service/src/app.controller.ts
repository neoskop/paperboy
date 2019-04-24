import { Controller, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express-serve-static-core';
import { ConfigService } from './config/config.service';
import { QueueService } from './queue/queue.service';

@Controller()
export class AppController {
  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('bearer'))
  async index(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug(
        `Received the following body from ${req.ip ||
          'an unknown IP'}: ${JSON.stringify(req.body)}`,
      );
      await this.queueService.notify(
        req.body.payload || '{}',
        req.body.source || this.configService.queueSource,
      );
      res.status(201).send('OK');
    } catch (err) {
      res.status(500).send('Fail');
    }
  }
}
