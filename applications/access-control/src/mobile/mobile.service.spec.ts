import { Test, TestingModule } from '@nestjs/testing';
import { MobileService } from './mobile.service';

describe('MobileService', () => {
  let service: MobileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MobileService],
    }).compile();

    service = module.get<MobileService>(MobileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
