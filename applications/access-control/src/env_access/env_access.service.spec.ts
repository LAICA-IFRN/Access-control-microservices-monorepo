import { Test, TestingModule } from '@nestjs/testing';
import { EnvAccessService } from './env_access.service';

describe('EnvAccessService', () => {
  let service: EnvAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvAccessService],
    }).compile();

    service = module.get<EnvAccessService>(EnvAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
