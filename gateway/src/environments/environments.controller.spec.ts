import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentsController } from './environments.controller';
import { EnvironmentsService } from './environments.service';

describe('EnvironmentsController', () => {
  let controller: EnvironmentsController;
  let service: EnvironmentsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
    // Mock other methods as needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvironmentsController],
      providers: [
        {
          provide: EnvironmentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EnvironmentsController>(EnvironmentsController);
    service = module.get<EnvironmentsService>(EnvironmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an environment', async () => {
    const createDto = { /* createEnvironmentDto */ };
    const createdData = { data: 'created environment data' };
    mockService.create.mockReturnValue(createdData);

    const result = await controller.create(createDto);

    expect(result).toBe(createdData);
  });

  it('should get all environments', async () => {
    const skip = 0;
    const take = 10;
    const environments = [{ data: 'environment 1' }, { data: 'environment 2' }];
    mockService.findAll.mockReturnValue(environments);

    const result = await controller.findAll(skip, take);

    expect(result).toBe(environments);
  });

  // Add more test cases for other methods
});
