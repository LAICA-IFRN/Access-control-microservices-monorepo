import { Test, TestingModule } from '@nestjs/testing';
import { Esp32Service } from './esp32.service';

describe('Esp32Service', () => {
  let service: Esp32Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Esp32Service],
    }).compile();

    service = module.get<Esp32Service>(Esp32Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
