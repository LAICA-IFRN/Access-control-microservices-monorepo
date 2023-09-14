import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUUID } from 'class-validator';
import { UpdateUserDataDto } from './dto/update-user-data.dto';
import { isValidCPF } from 'src/decorators/cpf-or-cnpj.decorator';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { FindToAccess } from './dto/find-to-access.dto';

@Injectable()
export class UserService {
  private readonly createAuditLogUrl = 'http://localhost:6004/audit/logs'
  private readonly errorLogger = new Logger()

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (
      createUserDto.roles.includes('ADMIN') 
      && createUserDto.roles.length > 1
    ) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao criar usuário: usuário admin não pode ter outros papéis',
          meta: {
            target: createUserDto.roles,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error.meta);
      });

      throw new HttpException(
        'Admin user cannot have other roles',
        HttpStatus.BAD_REQUEST
      );
    }

    const roundsOfHashing = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, roundsOfHashing);
  
    let documentType: string;
  
    if (createUserDto.identifier) {
      documentType = isValidCPF(createUserDto.identifier) ? 'CPF' : 'CNPJ';
    } else {
      documentType = 'REGISTRATION';
    }
  
    let createdUser: User;
  
    try {
      await this.prisma.$transaction(async (prisma) => {
        createdUser = await prisma.user.create({
          data: {
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashedPassword,
          },
        });

        await prisma.document.create({
          data: {
            content: createUserDto.identifier,
            DocumentType: { connect: { name: documentType } },
            User: { connect: { id: createdUser.id } },
          },
        });
      });
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar usuário: conflito com registro existente',
            meta: {
              target: error.meta.target,
              statusCode: 409
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(`Already exists: ${error.meta.target}`, HttpStatus.CONFLICT);
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException("Can't create user", HttpStatus.FORBIDDEN);
      }
    }

    for (const role of createUserDto.roles) {
      await this.prisma.userRoles.create({
        data: {
          User: { connect: { id: createdUser.id } },
          Role: { connect: { name: role } },
        },
      });
    }

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: "Usuários",
        type: "Info",
        message: `Usuário criado: ${createdUser.name || ''}`,
        meta: {
          target: createdUser.id
        }
      })
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao criar log', error);
    });

    // if (createUserDto.mac) {} // TODO: enviar msg para o serviço responsável
    // if (createUserDto.tag) {} // TODO: enviar msg para o serviço responsável
  
    return createdUser;
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao buscar usuário: id inválido',
          meta: {
            target: id,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prisma.user.findFirstOrThrow({
        where: { id, active: true },
        include: {
          UserRoles: {
            include: {
              Role: true
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao buscar usuário: usuário não encontrado',
            meta: {
              target: id,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
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
        Document: {
          content: findToAccess.user
        },
        active: true
      }
    });
    
    if (!user) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao buscar usuário: usuário não encontrado',
          meta: {
            user: findToAccess.user,
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });
      
      return { result: 404 }
    }

    const passwordMatch = await bcrypt.compare(findToAccess.password, user.password);

    if (!passwordMatch) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao buscar usuário: senha incorreta',
          meta: {
            target: user.id,
            statusCode: 401
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return { result: 401 };
    }

    return {
      result: user.id
    };
  }

  async findAllFrequenters() {
    return await this.prisma.user.findMany({
      where: {
        UserRoles: {
          some: {
            Role: {
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
        UserRoles: {
          some: {
            Role: {
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
        UserRoles: {
          some: {
            Role: {
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
        UserRoles: {
          include: {
            Role: true
          }
        }
      }
    });
  }

  async updateStatus(id: string, status: boolean) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao atualizar status de usuário: id inválido',
          meta: {
            target: id,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { 
          active: status, 
          UserRoles: {
            updateMany: {
              where: { userId: id },
              data: { active: status }
            },
          }
        },
        include: {
          UserRoles: true
        }
      });

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Info",
          message: 'Status de usuário atualizado: ' + (status ? 'Ativado' : 'Desativado'),
          meta: {
            target: user.id,
            status: user.active
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      // TODO: inativar tag, mac e relações com ambientes em seus respectivos serviços
      
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao atualizar status de usuário: usuário não encontrado',
            meta: {
              target: id,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao atualizar status de usuário: erro interno, verificar logs de erro do serviço',
            meta: {
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException("Can't create user", HttpStatus.FORBIDDEN);
      }
    }
  }

  // TODO: testar
  async update(id: string, updateUserDataDto: UpdateUserDataDto) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Error",
          message: 'Falha ao atualizar usuário: id inválido',
          meta: {
            target: id,
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
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
          Document: {
            update: {
              content: updateUserDataDto.identifier
            }
          }
        },
        where: { id },
        include: {
          Document: true
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Usuários",
          type: "Info",
          message: 'Usuário atualizado: ' + user.name || '',
          meta: {
            target: user.id
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao atualizar usuário: usuário não encontrado',
            meta: {
              target: id,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      } else if (error.code === 'P2002') {
        lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao atualizar usuário: conflito com registro existente',
            meta: {
              target: error.meta.target,
              statusCode: 409
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException('Already exists', HttpStatus.CONFLICT);
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Usuários",
            type: "Error",
            message: 'Falha ao atualizar usuário: erro interno, verificar logs de erro do serviço',
            meta: {
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException("Can't update user", HttpStatus.FORBIDDEN);
      }
    }
  }
}
