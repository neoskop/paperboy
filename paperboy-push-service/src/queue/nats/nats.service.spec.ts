import { Test, TestingModule } from '@nestjs/testing';
import { NatsService } from './nats.service';

describe('NatsService', () => {
  let service: NatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NatsService],
    }).compile();

    service = module.get<NatsService>(NatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
