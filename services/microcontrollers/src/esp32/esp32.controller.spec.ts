import { Test, TestingModule } from '@nestjs/testing';
import { Esp32Controller } from './esp32.controller';
import { Esp32Service } from './esp32.service';

describe('Esp32Controller', () => {
  let controller: Esp32Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Esp32Controller],
      providers: [Esp32Service],
    }).compile();

    controller = module.get<Esp32Controller>(Esp32Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
