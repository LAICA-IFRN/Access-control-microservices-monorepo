import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEnvManagerDto } from './dto/create-env_manager.dto';
import { EnvManagerStatusDto } from './dto/status-env_manager.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { isUUID } from 'class-validator';
import { AuditLogService } from 'src/logs/audit-log.service';

@Injectable()
export class EnvManagerService {
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly verifyRoleEndpoint = `${process.env.USERS_SERVICE_URL}/roles/verify`
  private readonly errorLogger = new Logger()

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createEnvManagerDto: CreateEnvManagerDto) {
    const isEnvManager = await lastValueFrom(
      this.httpService.get(this.verifyRoleEndpoint, {
        data: {
          userId: createEnvManagerDto.userId,
          roles: ['ENVIRONMENT_MANAGER'],
        },
      }).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Ambientes',
                type: 'Error',
                message: 'Falha ao verificar papel de usuário na criação de gestor de ambiente, id inválido',
                meta: {
                  target: [createEnvManagerDto.userId],
                  statusCode: 400
                }
              })
            )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            });

            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Ambientes',
                type: 'Error',
                message: 'Falha ao verificar papel de usuário na criação de gestor de ambiente, usuário não encontrado',
                meta: {
                  target: [createEnvManagerDto.userId],
                  statusCode: 404
                }
              })
            )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            });

            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Ambientes',
                type: 'Error',
                message: 'Falha ao verificar papel de usuário na criação de gestor de ambiente, erro interno verificar logs de erro no serviço',
                meta: {
                  target: [createEnvManagerDto.userId],
                  statusCode: 500
                }
              })
            )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            });

            throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }),
      ),
    ).then((response) => response.data);

    if (!isEnvManager) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha ao verificar papel de usuário na criação de gestor de ambiente, usuário não possui o papel gestor de ambiente',
          meta: {
            target: createEnvManagerDto.userId,
            statusCode: 403
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });
      
      throw new HttpException('User is not a enviroment manager', HttpStatus.FORBIDDEN);
    }

    const { userId, environmentId, requestUserId: createdBy } = createEnvManagerDto;
    const hasEnvAccess = await this.hasEnvAccessOnEnv(userId, environmentId)
      .then((response) => response)
      .catch((error) => {
        if (error[0] === 400) {
          throw new HttpException(
            "Invalid id entry",
            HttpStatus.BAD_REQUEST
          );
        } else if (error[0] === 404) {
          throw new HttpException(
            'Record not found: ' + error[1],
            HttpStatus.NOT_FOUND
          );
        } else {
          throw new HttpException(
            "Can't create environment manager",
            HttpStatus.FORBIDDEN
          );
        }
      });

    if (hasEnvAccess && typeof hasEnvAccess === 'boolean') {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha ao buscar paridade em ambiente na criação de gestor de ambiente, usuário possui acesso ativo ao ambiente',
          meta: {
            target: createEnvManagerDto.userId,
            statusCode: 403
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        'User has an active access in this environment', 
        HttpStatus.FORBIDDEN
      );
    }
    
    try {
      const envManager = await this.prisma.environment_manager.create({
        data: {
          user_name: createEnvManagerDto.userName,
          user_id: userId,
          environment_id: environmentId,
          created_by: createdBy,
        },
      });

      this.sendLogWhenCreateEnvManager(userId, environmentId, createdBy);

      return envManager;
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao criar gestor de ambiente, conflito com registro existente',
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

        throw new HttpException(
          `Already exists: ${error.meta.target}`,
          HttpStatus.CONFLICT
        );
      } else if (error.code === 'P2003') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao criar gestor de ambiente, violação de unicidade gestor-ambiente',
            meta: {
              target: error.meta.field_name,
              statusCode: 409
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          `Foreign key constraint failed on the field: ${error.meta.field_name}`,
          HttpStatus.CONFLICT
        );
      } else if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao criar gestor de ambiente, registro não encontrado',
            meta: {
              target: error.meta.target,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'Environment not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao criar gestor de ambiente, erro interno verificar logs de erro no serviço',
            meta: {
              target: error.meta.target,
              statusCode: 500
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);
        
        throw new HttpException(
          "Can't create environment manager",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async sendLogWhenCreateEnvManager(
    userId: string,
    environmentId: string,
    createdBy: string,
  ) {
    const user = await this.findUserForLog(userId);
    const createdByUser = await this.findUserForLog(createdBy);
    const environment = await this.prisma.environment.findFirst({
      where: {
        id: environmentId,
      },
      select: {
        name: true,
      }
    });

    const log = {
      type: 'Info',
      message: `${createdByUser.name} vinculou ${user.name} como o supervisor no ambiente ${environment.name}`,
      topic: 'Ambientes',
      meta: {
        target: [userId, environmentId, createdBy],
        statusCode: 201
      }
    };

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, log)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao criar log', error);
    });
  }

  async findAll() {
    return await this.prisma.environment_manager.findMany({
      where: {
        active: true,
      },
    });
  }

  async getEnvironmentUserData(userId: string, environmentId: string) {
    try {
      const data = await this.prisma.environment_manager.findFirst({
        where: {
          user_id: userId,
          environment_id: environmentId,
          active: true,
        },
        select: {
          id: true,
          environment: {
            select: {
              latitude: true,
              longitude: true,
              name: true,
            }
          }
        },
      })

      return {
        environmentUserId: data.id,
        latitude: data.environment.latitude,
        longitude: data.environment.longitude,
        name: data.environment.name,
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Environment user not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        throw new HttpException(
          "Can't find environment user",
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }
    }
  }

  async hasEnvAccessOnEnv(userId: string, environmentId: string) {
    if (!isUUID(userId) || !isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha ao verificar se usuário possui acesso no ambiente durante criação de gestor: id inválido',
          meta: {
            target: [userId, environmentId],
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return [400]
    }

    try {
      const envAccess = await this.prisma.environment_user.findFirst({
        where: { 
          user_id: userId,
          environment_id: environmentId,
          active: true,
        }
      })
  
      const hasEnvAccess = envAccess ? true : false;
      return hasEnvAccess
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Gestor de Ambiente',
            type: 'Error',
            message: 'Falha ao verificar se usuário possui acesso no ambiente durante criação de gestor: registro não encontrado',
            meta: {
              userId,
              environmentId,
              statusCode: 404
            }
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        return [404, [userId, environmentId]]

      } else {
        return [500]
      }
    }

  }

  async verifyManagerByUser(userId: string, environmentId: string) {
    if (!isUUID(userId) || !isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha verificar se usuário possui acesso ao ambiente: id inválido',
          meta: {
            target: [userId, environmentId],
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    const envAccess = await this.prisma.environment_user.findFirst({
      where: { 
        user_id: userId,
        environment_id: environmentId,
      }
    });

    const hasEnvAccess = envAccess ? true : false;
    const active = envAccess?.active;
    
    return {
      hasEnvAccess,
      active
    }
  }

  async findAccessByUser(userId: string, environmentId: string) {
    const envManager = await this.prisma.environment_manager.findFirst({
      where: {
        environment_id: environmentId,
        user_id: userId,
        active: true,
      },
      include: {
        environment: {
          select: {
            name: true,
          }
        }
      }
    });

    if (!envManager) {
      return null;
    }
    
    return { access: true, environmentName: envManager.environment.name };
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha ao buscar gestor de ambiente: id inválido',
          meta: {
            target: [id],
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      return await this.prisma.environment_manager.findUnique({
        where: {
          id,
          active: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao buscar gestor de ambiente: registro não encontrado',
            meta: {
              target: error.meta.target,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'Environment manager not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao buscar gestor de ambiente: erro interno, verificar logs de erro no serviço',
            meta: {
              target: error.meta.target,
              statusCode: 500
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);

        throw new HttpException(
          "Can't find environment manager",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async findAllByUserId(userId: string) {
    if (!isUUID(userId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha ao buscar todos os gestores de ambiente por usuário: id inválido',
          meta: {
            target: [userId],
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.prisma.environment_manager.findMany({
      where: {
        user_id: userId,
        active: true,
      },
    });
  }

  async findAllByEnvironmentId(environmentId: string) {
    if (!isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha ao buscar todos os gestores de ambiente por ambiente: id inválido',
          meta: {
            target: [environmentId],
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.prisma.environment_manager.findMany({
      where: {
        environment_id: environmentId,
        active: true,
      },
    });
  }

  async updateStatus(id: string, envManagerStatusDto: EnvManagerStatusDto) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Ambientes',
          type: 'Error',
          message: 'Falha ao atualizar status do gestor de ambiente: id inválido',
          meta: {
            target: [id],
            statusCode: 400
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const envManager = await this.prisma.environment_manager.update({
        where: {
          id,
        },
        data: {
          active: envManagerStatusDto.status,
        },
      });

      this.sendLogWhenEnvironmentManagerIsUpdated(
        envManager.user_name,
        envManagerStatusDto.requestUserId,
        envManager.environment_id,
        envManagerStatusDto
      )

      return {
        active: envManager.active,
      }
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao at ualizar status do gestor de ambiente: registro não encontrado',
            meta: {
              target: error.meta.target,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'Environment manager not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Ambientes',
            type: 'Error',
            message: 'Falha ao atualizar status do gestor de ambiente: erro interno, verificar logs de erro no serviço',
            meta: {
              target: error.meta.target,
              statusCode: 500
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);

        throw new HttpException(
          "Can't update environment manager status",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async sendLogWhenEnvironmentManagerIsUpdated(
    userName: string,
    createdBy: string,
    environmentId: string,
    meta?: any,
  ) {
    const created_by_user = await this.findUserForLog(createdBy);
    const environment = await this.prisma.environment.findFirst({
      where: {
        id: environmentId,
      },
      select: {
        name: true,
      }
    });

    await this.auditLogService.create({
      topic: 'Ambientes',
      type: 'Info',
      message: `${created_by_user.name} atualizou status do vinculo do supervisor ${userName} no ambiente ${environment.name} para ${meta.status ? 'ativo' : 'inativo'}`,
      meta: meta,
    });
  }

  private async findUserForLog(userId: string) {
    const user = await lastValueFrom(
      this.httpService.get(`${process.env.USERS_SERVICE_URL}/${userId}`)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao se conectar com o serviço de usuários (500)', error);
      throw new HttpException('Internal server error when search user on remote access', HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return user;
  }
}
