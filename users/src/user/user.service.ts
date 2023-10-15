import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { user } from '@prisma/client';
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
        this.auditLogService.create(AuditConstants.createUserP2002({target: error.meta.target, statusCode: 409}));
        throw new HttpException(`Already exists: ${error.meta.target}`, HttpStatus.CONFLICT);
      } else {
        this.auditLogService.create(AuditConstants.createUser({context: error, statusCode: 422}));
        throw new HttpException("Can't create user", HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }

    let roles
    for (const role of createUserDto.roles) {
      roles = await this.prisma.user_role.create({
        data: {
          user: { connect: { id: createdUser.id } },
          role: { connect: { name: role } },
        },
      });
    }

    if (roles.length !== createUserDto.roles.length) {
      this.auditLogService.create({
        topic: "Usuários",
        type: "Error",
        message: 'Falha ao criar papés de usuário: erro interno, verificar logs de erro do serviço',
        meta: {
          expected: createUserDto.roles,
          created: roles.map((role) => role.Role.name),
          statusCode: 403
        }
      });
    }

    this.auditLogService.create({
      topic: "Usuários",
      type: "Info",
      message: 'Usuário criado: ' + createdUser.name || '',
      meta: {
        target: createdUser.id
      }
    });

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

  async findUserPhoto(userId: string) {
    if (!isUUID(userId)) {
      this.auditLogService.create({
        topic: "Usuários",
        type: "Error",
        message: 'Falha ao buscar foto de usuário: id inválido',
        meta: {
          userId,
          statusCode: 400
        }
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      const userImage = await this.prisma.user_image.findFirst({
        where: { user_id: userId }
      });

      if (!userImage) {
        this.auditLogService.create({
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao buscar foto de usuário: usuário não encontrado',
          meta: {
            userId,
            statusCode: 404
          }
        });

        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return userImage.encoded;
    } catch (error) {
      this.errorLogger.error('Falha ao buscar foto de usuário', error);

      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      this.auditLogService.create({
        topic: "Usuários",
        type: "Error",
        message: 'Falha ao buscar usuário: id inválido',
        meta: {
          target: id,
          statusCode: 400
        }
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prisma.user.findFirstOrThrow({
        where: { id, active: true },
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
        this.auditLogService.create({
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao buscar usuário: usuário não encontrado',
          meta: {
            target: id,
            statusCode: 404
          }
        });

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
      this.auditLogService.create({
        topic: "Usuários",
        type: "Error",
        message: 'Falha ao buscar usuário durante acesso: usuário não encontrado',
        meta: {
          user: findToAccess.user
        }
      });
      
      return { result: 404 }
    }

    const passwordMatch = await bcrypt.compare(findToAccess.password, user.password);

    if (!passwordMatch) {
      this.auditLogService.create({
        topic: "Usuários",
        type: "Error",
        message: 'Falha ao buscar usuário durante acesso: senha incorreta',
        meta: {
          userId: user.id,
          statusCode: 401
        }
      });

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
      // this.auditLog.create({
      //   topic: "Usuários",
      //   type: "Error",
      //   message: 'Falha ao buscar usuário durante validação de token: usuário não encontrado',
      //   meta: {
      //     user: validateToToken.document
      //   }
      // });
      
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await bcrypt.compare(validateToToken.password, user.password);

    if (!passwordMatch) {
      // this.auditLog.create({
      //   topic: "Usuários",
      //   type: "Error",
      //   message: 'Falha ao buscar usuário durante validação de token: senha incorreta',
      //   meta: {
      //     userId: user.id,
      //     statusCode: 401
      //   }
      // });

      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }

    return { userId: user.id };
  }

  async findAllFrequenters() {
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
  }

  async findAllAdmins() {
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
  }

  async findAllEnvironmentManager() {
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
  }

  async findAllInactive() {
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
  }

  async updateStatus(id: string, status: boolean, userId: string) {
    if (!isUUID(id)) {
      this.auditLogService.create({
        topic: "Usuários",
        type: "Error",
        message: 'Falha ao atualizar status de usuário: id inválido',
        meta: {
          target: id,
          statusCode: 400
        }
      });

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

      this.auditLogService.create({
        topic: "Usuários",
        type: "Info",
        message: `Status de usuário atualizado: ${user.name} - ${user.active ? 'Ativo' : 'Inativo'}`,
        meta: {
          author: userId
        }
      });

      // TODO: inativar tag, mac e relações com ambientes em seus respectivos serviços
      
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create({
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao atualizar status de usuário: usuário não encontrado',
          meta: {
            target: id,
            statusCode: 404
          }
        });

        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        this.auditLogService.create({
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao atualizar status de usuário: erro interno, verificar logs de erro do serviço',
          meta: {
            context: error,
            statusCode: 403
          }
        });

        throw new HttpException("Can't create user", HttpStatus.FORBIDDEN);
      }
    }
  }

  // TODO: testar
  async update(id: string, updateUserDataDto: UpdateUserDataDto, userId: string) {
    if (!isUUID(id)) {
      this.auditLogService.create({
        topic: "Usuários",
        type: "Error",
        message: 'Falha ao atualizar usuário: id inválido',
        meta: {
          target: id,
          statusCode: 400
        }
      });

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

      this.auditLogService.create({
        topic: "Usuários",
        type: "Info",
        message: `Usuário atualizado: ${user.name}`,
        meta: {
          userId: user.id
        }
      });

      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create({
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao atualizar usuário: usuário não encontrado',
          meta: {
            target: id,
            statusCode: 404
          }
        });

        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      } else if (error.code === 'P2002') {
        this.auditLogService.create({
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao atualizar usuário: conflito com registro existente',
          meta: {
            target: error.meta.target,
            statusCode: 409
          }
        });

        throw new HttpException('Already exists', HttpStatus.CONFLICT);
      } else {
        this.auditLogService.create({
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao atualizar usuário: erro interno, verificar logs de erro do serviço',
          meta: {
            context: error,
            statusCode: 422
          }
        });

        throw new HttpException("Can't update user", HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }
  }
}
