import { Test, TestingModule } from '@nestjs/testing';
import { RfidController } from './rfid.controller';
import { RfidService } from './rfid.service';

describe('RfidController', () => {
  let controller: RfidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RfidController],
      providers: [RfidService],
    }).compile();

    controller = module.get<RfidController>(RfidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
