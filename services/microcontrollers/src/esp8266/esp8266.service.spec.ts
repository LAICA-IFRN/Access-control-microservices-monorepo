import { Test, TestingModule } from '@nestjs/testing';
import { Esp8266Service } from './esp8266.service';

describe('Esp8266Service', () => {
  let service: Esp8266Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Esp8266Service],
    }).compile();

    service = module.get<Esp8266Service>(Esp8266Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
