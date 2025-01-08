import { Test, TestingModule } from '@nestjs/testing';
import { EnvAccessController } from './env_access.controller';
import { EnvAccessService } from './env_access.service';

describe('EnvAccessController', () => {
  let controller: EnvAccessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvAccessController],
      providers: [EnvAccessService],
    }).compile();

    controller = module.get<EnvAccessController>(EnvAccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
