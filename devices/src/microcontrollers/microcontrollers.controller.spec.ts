import { Test, TestingModule } from '@nestjs/testing';
import { MicrocontrollersController } from './microcontrollers.controller';
import { MicrocontrollersService } from './microcontrollers.service';

describe('MicrocontrollersController', () => {
  let controller: MicrocontrollersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicrocontrollersController],
      providers: [MicrocontrollersService],
    }).compile();

    controller = module.get<MicrocontrollersController>(MicrocontrollersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
