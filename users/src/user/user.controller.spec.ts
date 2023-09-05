import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRequestEntity } from './entities/user-request.entity';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(() => {
    service = new UserService(new PrismaService());
    controller = new UserController(service);
  });

  it('should create a new user', async () => {
    const createUserDto = new CreateUserDto();
    createUserDto.name = 'John Doe';
    createUserDto.email = 'johndoe@example.com';
    createUserDto.password = 'password123';

    const user = await controller.create(createUserDto);

    expect(user).not.toBeNull();
    expect(user.name).toEqual('John Doe');
    expect(user.email).toEqual('johndoe@example.com');
    expect(user.password).toEqual('password123');
  });

  it('should find all admins', async () => {
    const admins = await controller.findAllAdmins();

    expect(admins).not.toBeNull();
    expect(admins.length).toBeGreaterThanOrEqual(0);
  });

  it('should find all frequenters', async () => {
    const frequenters = await controller.findAllFrequenters();

    expect(frequenters).not.toBeNull();
    expect(frequenters.length).toBeGreaterThanOrEqual(0);
  });

  it('should find all environment managers', async () => {
    const environmentManagers = await controller.findAllEnvironmentManager();

    expect(environmentManagers).not.toBeNull();
    expect(environmentManagers.length).toBeGreaterThanOrEqual(0);
  });

  it('should find all inactive users', async () => {
    const inactiveUsers = await controller.findAllInactive();

    expect(inactiveUsers).not.toBeNull();
    expect(inactiveUsers.length).toBeGreaterThanOrEqual(0);
  });
});