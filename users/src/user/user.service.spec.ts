import { Test, TestingModule } from '@nestjs/testing';
import { Roles } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(dto => dto)
            }
          }
        }
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  // describe('create', () => {
  //   it('should create a new user', async () => {
  //     const createUserDto: CreateUserDto = {
  //       name: 'John Doe',
  //       email: 'johndoe@email.com',
  //       registration: '123456789',
  //       password: 'password123',
  //       roles: [Roles.ADMIN]
  //     };

  //     const user = await service.create(createUserDto);
  //     console.log(user);
      
  //     expect(user).not.toBeNull();
  //   });
  // });
});