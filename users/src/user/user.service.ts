import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { user, user_role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUUID } from 'class-validator';
import { UpdateUserDataDto } from './dto/update-user-data.dto';
import { HttpService } from '@nestjs/axios';
import { FindToAccess } from './dto/find-to-access.dto';
import { ValidateToToken } from './dto/validate-to-token.dto';
import { AuditLogService } from 'src/providers/audit-log/audit-log.service';
import { AuditConstants } from 'src/providers/audit-log/audit-contants';

@Injectable()
export class UserService {
  private readonly createMobileDeviceUrl = `${process.env.DEVICES_SERVICE_URL}/mobile`
  private readonly createRFIDDeviceUrl = `${process.env.DEVICES_SERVICE_URL}/rfid`
  private readonly errorLogger = new Logger()
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly auditLogService: AuditLogService
  ) {}

  async create(createUserDto: CreateUserDto, userId: string) {
    if (
      createUserDto.roles.includes('ADMIN')
      && createUserDto.roles.length > 1
    ) {
      this.auditLogService.create(AuditConstants.createUserBadRequest({target: createUserDto, statusCode: 400}));
      throw new HttpException('Admin user cannot have other roles', HttpStatus.BAD_REQUEST);
    }

    const roundsOfHashing = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, roundsOfHashing);

    let createdUser: user;
  
    try {
      createdUser = await this.prisma.user.create(this.factoryCreateUser(createUserDto, hashedPassword, userId));
    } catch (error) {
      if (error.code === 'P2002') {
        this.auditLogService.create(AuditConstants.createUserConflict({target: error.meta.target, statusCode: 409}));
        throw new HttpException(`Already exists: ${error.meta.target}`, HttpStatus.CONFLICT);
      } else {
        this.auditLogService.create(AuditConstants.createUserError({context: error, statusCode: 422}));
        throw new HttpException("Can't create user", HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }

    let roles: any
    for (const role of createUserDto.roles) {
      roles = await this.prisma.user_role.create({
        data: {
          user: { connect: { id: createdUser.id } },
          role: { connect: { name: role } },
        },
      });
    }

    if (roles.length !== createUserDto.roles.length) {
      this.auditLogService.create(AuditConstants.createUserRolesError({
        expected: createUserDto.roles, 
        created: roles.map((role) => role.Role.name), 
        statusCode: 403
      }));
    }

    this.auditLogService.create(AuditConstants.createUserOk({userId: createdUser.id, author: userId, statusCode: 201}));

    // if (createUserDto.mac) {} // TODO: enviar msg para o serviço responsável
    // if (createUserDto.tag) {} // TODO: enviar msg para o serviço responsável
  
    return createdUser;
  }

  private factoryCreateUser(createUserDto: CreateUserDto, hashedPassword: string, userId: string): any {
    return {
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        active: true,
        user_image: {
          create: {
            encoded: createUserDto.encodedImage
          }
        },
        document_type: { connect: { name: createUserDto.documentType } },
        document: createUserDto.document,
        created_by: userId
      }
    };
  }

  async findUserImage(userId: string) {
    if (!isUUID(userId)) {
      this.auditLogService.create(AuditConstants.findUserImageBadRequest({userId, statusCode: 400}))
      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      const userImage = await this.prisma.user_image.findFirst({
        where: { user_id: userId }
      });

      if (!userImage) {
        this.auditLogService.create(AuditConstants.findUserImageBadRequest({userId, statusCode: 404}))
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return userImage.encoded;
    } catch (error) {
      this.errorLogger.error('Falha ao buscar foto de usuário', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(userId: string) {
    if (!isUUID(userId)) {
      this.auditLogService.create(AuditConstants.findOneBadRequest({userId, statusCode: 400}))
      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prisma.user.findFirstOrThrow({
        where: { id: userId, active: true },
        include: {
          user_role: {
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.findOneNotFound({userId, statusCode: 404}))
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      } else {
        this.errorLogger.error('Falha do sistema (500)', error.response);
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async findOneToAccess(findToAccess: FindToAccess) {
    const user = await this.prisma.user.findFirst({
      where: {
        document: findToAccess.user,
        active: true
      }
    });
    
    if (!user) {
      this.auditLogService.create(AuditConstants.findOneNotFound({document: findToAccess.user, statusCode: 404}))
      return { result: 404 }
    }

    const passwordMatch = await bcrypt.compare(findToAccess.password, user.password);

    if (!passwordMatch) {
      this.auditLogService.create(AuditConstants.findOneToAccessUnauthorizhed({userId: user.id, statusCode: 401}))
      return { result: 401 };
    }

    return {
      result: user.id
    };
  }

  async validateToToken(validateToToken: ValidateToToken) {
    const user = await this.prisma.user.findFirst({
      where: {
        document: validateToToken.document,
        active: true
      }
    });
    
    if (!user) {
      this.auditLogService.create(AuditConstants.validateToTokenNotFound({document: user.document, statusCode: 404}))
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await bcrypt.compare(validateToToken.password, user.password);

    if (!passwordMatch) {
      this.auditLogService.create(AuditConstants.validateToTokenUnauthorizhed({userId: user.id, statusCode: 401}))
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }

    return { userId: user.id };
  }

  async findAllFrequenters() {
    try {
      return await this.prisma.user.findMany({
        where: {
          user_role: {
            some: {
              role: {
                name: 'FREQUENTER'
              },
              active: true
            }
          },
          active: true
        }
      });
    } catch (error) {
      this.auditLogService.create(AuditConstants.findAllError({target: 'frequenters', statusCode: 500}))
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllAdmins() {
    try {
      return await this.prisma.user.findMany({
        where: {
          user_role: {
            some: {
              role: {
                name: 'ADMIN'
              },
              active: true
            }
          },
          active: true
        }
      });
    } catch (error) {
      this.auditLogService.create(AuditConstants.findAllError({target: 'admins', statusCode: 500}))
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllEnvironmentManager() {
    try {
      return await this.prisma.user.findMany({
        where: {
          user_role: {
            some: {
              role: {
                name: 'ENVIRONMENT_MANAGER'
              },
              active: true
            }
          },
          active: true
        }
      });
    } catch (error) {
      this.auditLogService.create(AuditConstants.findAllError({target: 'environment_managers', statusCode: 500}))
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllInactive() {
    try {
      return await this.prisma.user.findMany({
        where: {
          active: false
        },
        include: {
          user_role: {
            include: {
              role: true
            }
          }
        }
      });
    } catch (error) {
      this.auditLogService.create(AuditConstants.findAllError({target: 'inactives', statusCode: 500}))
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus(id: string, status: boolean, userId: string) {
    if (!isUUID(id)) {
      this.auditLogService.create(AuditConstants.updateStatusBadRequest({userId: id, statusCode: 400}))
      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { 
          active: status, 
          user_role: {
            updateMany: {
              where: { user_id: id },
              data: { active: status }
            },
          }
        },
        include: {
          user_role: true
        }
      });

      this.auditLogService.create(AuditConstants.updateStatusOk({userId: id, name: user.name, active: user.active}))
      // TODO: inativar tag, mac e relações com ambientes em seus respectivos serviços
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.updateStatusNotFound({userId, statusCode: 404}))
        throw new HttpException('User not found',  HttpStatus.NOT_FOUND);
      } else {
        this.auditLogService.create(AuditConstants.updateStatusNotFound({context: error, statusCode: 422}))
        throw new HttpException("Can't update user status", HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }
  }

  // TODO: testar
  async update(id: string, updateUserDataDto: UpdateUserDataDto, userId: string) {
    if (!isUUID(id)) {
      this.auditLogService.create(AuditConstants.updateBadRequest({userId: id, author: userId}))
      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    if (updateUserDataDto.password) {
      const roundsOfHashing = 10;
      updateUserDataDto.password = await bcrypt.hash(updateUserDataDto.password, roundsOfHashing);
    }

    try {
      const user = await this.prisma.user.update({
        data: {
          name: updateUserDataDto.name,
          email: updateUserDataDto.email,
          password: updateUserDataDto.password,
          document: updateUserDataDto.document
        },
        where: { id }
      })

      this.auditLogService.create(AuditConstants.updateOk({userId: id, author: userId}))
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.updateNotFound({userId: id, statusCode: 404}))
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      } else if (error.code === 'P2002') {
        this.auditLogService.create(AuditConstants.updateNotFound({userId: id, statusCode: 409, author: userId, target: error.meta.target}))
        throw new HttpException('Already exists', HttpStatus.CONFLICT);
      } else {
        this.auditLogService.create(AuditConstants.updateError({statusCode: 422, author: userId, target: error.meta.target}))
        throw new HttpException("Can't update user", HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }
  }
}
