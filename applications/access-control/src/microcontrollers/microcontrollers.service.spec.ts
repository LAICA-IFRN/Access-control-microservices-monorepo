import { Test, TestingModule } from '@nestjs/testing';
import { MicrocontrollersService } from './microcontrollers.service';

describe('MicrocontrollersService', () => {
  let service: MicrocontrollersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MicrocontrollersService],
    }).compile();

    service = module.get<MicrocontrollersService>(MicrocontrollersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
