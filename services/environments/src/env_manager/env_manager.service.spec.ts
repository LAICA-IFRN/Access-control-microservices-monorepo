import { Test, TestingModule } from '@nestjs/testing';
import { EnvManagerService } from './env_manager.service';

describe('EnvManagerService', () => {
  let service: EnvManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvManagerService],
    }).compile();

    service = module.get<EnvManagerService>(EnvManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // faça um teste de busca de todos os ambientes
  
});
