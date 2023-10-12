import { Test, TestingModule } from '@nestjs/testing';
import { Esp8266Controller } from './esp8266.controller';
import { Esp8266Service } from './esp8266.service';

describe('Esp8266Controller', () => {
  let controller: Esp8266Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Esp8266Controller],
      providers: [Esp8266Service],
    }).compile();

    controller = module.get<Esp8266Controller>(Esp8266Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
