import { Test, TestingModule } from '@nestjs/testing';
import { TerminusOptionsServiceService } from './terminus-options-service.service';

describe('TerminusOptionsServiceService', () => {
  let service: TerminusOptionsServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TerminusOptionsServiceService],
    }).compile();

    service = module.get<TerminusOptionsServiceService>(TerminusOptionsServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
