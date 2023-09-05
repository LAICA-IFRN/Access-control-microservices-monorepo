import { Test, TestingModule } from '@nestjs/testing';
import { EnvManagerController } from './env_manager.controller';
import { EnvManagerService } from './env_manager.service';

describe('EnvManagerController', () => {
  let controller: EnvManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvManagerController],
      providers: [EnvManagerService],
    }).compile();

    controller = module.get<EnvManagerController>(EnvManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
