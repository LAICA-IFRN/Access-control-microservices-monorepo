import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEnvAccessDto } from './dto/create-env_access.dto';
import { UpdateEnvAccessDto } from './dto/update-env_access.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { isUUID } from 'class-validator';
import { EnvAccessStatusDto } from './dto/status-env_access.dto';
import { Access, EnvAccess } from '@prisma/client';

@Injectable()
export class EnvAccessService {
  private readonly verifyRoleEndpoint = `${process.env.USERS_SERVICE_URL}/roles/verify`
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly errorLogger = new Logger()

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(createEnvAccessDto: CreateEnvAccessDto) {
    const isFrequenter = await lastValueFrom(
      this.httpService.get(this.verifyRoleEndpoint, {
        data: {
          userId: createEnvAccessDto.userId,
          roles: ['FREQUENTER'],
        },
      }).pipe(
        catchError((error) => {
          console.log(error);
          
          if (error.response.data.statusCode === 400) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Acesso de ambiente',
                type: 'Error',
                message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente: id inválido',
                meta: {
                  target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {role: 'FREQUENTER'}],
                  statusCode: error.response.data.statusCode,
                },
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
                topic: 'Acesso de ambiente',
                type: 'Error',
                message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente: usuário não encontrado',
                meta: {
                  target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {role: 'FREQUENTER'}],
                  statusCode: error.response.data.statusCode,
                },
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
                topic: 'Acesso de ambiente',
                type: 'Error',
                message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente: erro interno',
                meta: {
                  target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {role: 'FREQUENTER'}],
                  statusCode: error.response.data.statusCode,
                },
              })
            )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            });

            this.errorLogger.error('Falha do sistema na criação de acesso à ambiente', error);
            throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }),
      ),
    ).then((response) => response.data);

    if (!isFrequenter) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente: usuário não é um frequentador',
          meta: {
            target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {role: 'FREQUENTER'}],
            statusCode: 403,
          },
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('User is not a frequenter', HttpStatus.FORBIDDEN);
    }

    const { userId, environmentId } = createEnvAccessDto;
    const hasEnvManager = await this.hasEnvManagerOnEnv(userId, environmentId).then((response) => response);
    
    if (hasEnvManager) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar paridade em ambiente na criação de gestor de ambiente: usuário é um gestor ativo',
          meta: {
            target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
            statusCode: 403,
          },
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        'User is an active manager in this environment', 
        HttpStatus.FORBIDDEN
      );
    }

    const startPeriod = new Date(createEnvAccessDto.startPeriod);
    const endPeriod = new Date(createEnvAccessDto.endPeriod);

    if (startPeriod >= endPeriod) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao verificar período de acesso na criação de acesso à ambiente: período de início maior ou igual ao período de término',
          meta: {
            target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {startPeriod: createEnvAccessDto.startPeriod, endPeriod: createEnvAccessDto.endPeriod}],
            statusCode: 400,
          },
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        'startPeriod must be less than endPeriod',
        HttpStatus.BAD_REQUEST
      );
    }

    let envAccess: EnvAccess;
    try {
      envAccess = await this.prisma.envAccess.create({
        data: {
          userId: createEnvAccessDto.userId,
          environmentId: createEnvAccessDto.environmentId,
          startPeriod,
          endPeriod,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao criar acesso à ambiente: registro já existe',
            meta: {
              target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
              statusCode: 400,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'Environment access already exists',
          HttpStatus.BAD_REQUEST
        );
      } else if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao criar acesso à ambiente: registro não encontrado',
            meta: {
              target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
              statusCode: 404,
            },
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
      } else if (error.code === 'P2003') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao criar acesso à ambiente: chave duplicada',
            meta: {
              target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
              statusCode: 400,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'Environment access already exists',
          HttpStatus.CONFLICT
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao criar acesso à ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
              statusCode: 500,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);

        throw new HttpException(
          "Can't create environment access",
          HttpStatus.FORBIDDEN
        );
      }
    }

    const accesses: Access[] = [];
    for (const access of createEnvAccessDto.access) {
      const startTime = new Date(
        new Date().toDateString() + ' ' + access.startTime
      );
      const endTime = new Date(
        new Date().toDateString() + ' ' + access.endTime
      );

      if (startTime >= endTime) {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao criar acesso à ambiente: horário de início maior ou igual ao horário de término',
            meta: {
              target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {startTime: access.startTime, endTime: access.endTime}],
              statusCode: 400,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });
        
        try {
          await this.prisma.envAccess.delete({
            where: {
              id: envAccess.id,
            },
          });          
        } catch (error) {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao deletar acesso à ambiente durante cancelamento de sua criação: erro interno, verificar logs de erro do serviço',
              meta: {
                target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
                statusCode: 500,
              },
            })
          )
          .then((response) => response.data)
          .catch((error) => {
            this.errorLogger.error('Falha ao criar log', error);
          });

          this.errorLogger.error('Falha do sistema (500)', error);

          throw new HttpException(
            "Can't create environment access",
            HttpStatus.FORBIDDEN
          );
        }

        throw new HttpException(
          'startTime must be less than endTime',
          HttpStatus.BAD_REQUEST
        );
      }

      try {
        for (const day of access.days) {
          accesses.push(
            await this.prisma.access.create({
              data: {
                day,
                startTime,
                endTime,
                envAccessId: envAccess.id, 
              }
            })
          );
        }
      } catch (error) {
        await this.prisma.envAccess.delete({
          where: {
            id: envAccess.id,
          },
        });

        if (error.code === 'P2002') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao criar acesso à ambiente: registro já existe',
              meta: {
                target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
                statusCode: 400,
              },
            })
          )
          .then((response) => response.data)
          .catch((error) => {
            this.errorLogger.error('Falha ao criar log', error);
          });

          throw new HttpException(
            'Environment access already exists',
            HttpStatus.BAD_REQUEST
          );
        } else if (error.code === 'P2025') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao criar acesso à ambiente: registro não encontrado',
              meta: {
                target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
                statusCode: 404,
              },
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
        } else if (error.code === 'P2003') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao criar acesso à ambiente: chave duplicada',
              meta: {
                target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
                statusCode: 400,
              },
            })
          )
          .then((response) => response.data)
          .catch((error) => {
            this.errorLogger.error('Falha ao criar log', error);
          });

          throw new HttpException(
            'Environment access already exists',
            HttpStatus.CONFLICT
          );
        } else {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao criar acesso à ambiente: erro interno, verificar logs de erro do serviço',
              meta: {
                target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId],
                statusCode: 500,
              },
            })
          )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error);
          });
        }
      }
    }

    return {
      ...envAccess,
      accesses,
    };
  }

  async findParity(createEnvAccessDto: CreateEnvAccessDto) {
    const startPeriod = new Date(createEnvAccessDto.startPeriod);
    const endPeriod = new Date(createEnvAccessDto.endPeriod);

    if (startPeriod >= endPeriod) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao verificar período de acesso na criação de acesso à ambiente: período de início maior ou igual ao período de término',
          meta: {
            target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {startPeriod: createEnvAccessDto.startPeriod, endPeriod: createEnvAccessDto.endPeriod}],
            statusCode: 400,
          },
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        'startPeriod must be less than endPeriod',
        HttpStatus.BAD_REQUEST
      );
    }

    const parity = []
    for (const access of createEnvAccessDto.access) {
      const startTime = new Date(
        new Date().toDateString() + ' ' + access.startTime
      );

      const endTime = new Date(
        new Date().toDateString() + ' ' + access.endTime
      );

      if (startTime >= endTime) {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao buscar paridade de acesso à ambiente: horário de início maior ou igual ao horário de término',
            meta: {
              target: [createEnvAccessDto.userId, createEnvAccessDto.environmentId, {startTime: access.startTime, endTime: access.endTime}],
              statusCode: 400,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'startTime must be less than endTime',
          HttpStatus.BAD_REQUEST
        );
      }

      // buscar conflito de horário e período
      const envAccesses = await this.prisma.envAccess.findMany({
        where: {
          userId: createEnvAccessDto.userId,
          active: true,
          startPeriod: {
            lte: startPeriod,
          },
          endPeriod: {
            gte: endPeriod,
          },
          NOT: {
            environmentId: createEnvAccessDto.environmentId,
          },
          Access: {
            some: {
              day: {
                in: access.days,
              },
              OR: [
                {
                  startTime: {
                    lte: startTime,
                  },
                  endTime: {
                    gte: startTime,
                  },
                },
                {
                  startTime: {
                    lte: endTime,
                  },
                  endTime: {
                    gte: endTime,
                  },
                },
                {
                  startTime: {
                    gte: startTime,
                  },
                  endTime: {
                    lte: endTime,
                  },
                },
              ],
            },
          },
        },
        select: {
          startPeriod: true,
          endPeriod: true,
          Access: {
            select: {
              day: true,
              startTime: true,
              endTime: true,
            }
          }
        }
      });

      parity.push(envAccesses);
    }

    return parity;
  }

  async findAll(skip?: number, take?: number) {
    return await this.prisma.envAccess.findMany({
      where: {
        active: true,
      },
      skip,
      take,
    });
  }

  async hasEnvManagerOnEnv(userId: string, environmentId: string) {
    if (!isUUID(userId) || !isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar conflito de usuário gestor em ambiente: id inválido',
          meta: {
            target: [userId, environmentId],
            statusCode: 400,
          },
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

    const envManager = await this.prisma.envManager.findFirst({
      where: { 
        userId, 
        environmentId,
        active: true,
      }
    });

    const hasEnvManager = envManager ? true : false;
    
    return hasEnvManager
  }

  async verifyAccessByUser(userId: string, environmentId: string) {
    if (!isUUID(userId) || !isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao verificar acesso de usuário em ambiente: id inválido',
          meta: {
            target: [userId, environmentId],
            statusCode: 400,
          },
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

    const envManager = await this.prisma.envManager.findFirst({
      where: { 
        userId, 
        environmentId
      }
    });

    const hasEnvManager = envManager ? true : false;
    const active = envManager?.active;
    
    return {
      hasEnvManager,
      active
    }
  }

  async findAccessByUser(userId: string, environmentId: string) {
    if (!isUUID(userId) || !isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar acesso de usuário em ambiente: id inválido',
          meta: {
            userId,
            environmentId
          },
        }).pipe(
          catchError((error) => {
            console.log(error);
            throw new HttpException(
              "Invalid id entry",
              HttpStatus.BAD_REQUEST
            );
          })
        )
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }
    
    const now = new Date();
    const access = await this.prisma.envAccess.findFirst({
      where: {
        userId,
        environmentId,
        active: true,
        startPeriod: {
          lte: now,
        },
        endPeriod: {
          gte: now,
        },
        Access: {
          some: {
            day: now.getDay(),
            startTime: {
              lte: now,
            },
            endTime: {
              gte: now,
            },
          }
        }
      },
    });

    return {
      access: access ? true : false,
    };
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar acesso à ambiente: id inválido',
          meta: {
            target: [id],
            statusCode: 400,
          },
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
      return await this.prisma.envAccess.findFirstOrThrow({
        where: {
          id,
          active: true,
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao buscar acesso à ambiente: registro não encontrado',
            meta: {
              target: [id],
              statusCode: 404,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          'Environment access not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao buscar acesso à ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              target: [id],
              statusCode: 500,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha ao buscar acesso à ambiente', error);

        throw new HttpException(
          "Can't find environment access",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async findAllByFrequenter(userId: string) {
    if (!isUUID(userId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar os acessos à ambiente de frequentador: id inválido',
          meta: {
            target: [userId],
            statusCode: 400,
          },
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

    return await this.prisma.envAccess.findMany({
      where: {
        userId,
        active: true,
      },
    });
  }

  async findAllInactives() {
    return await this.prisma.envAccess.findMany({
      where: {
        active: false,
      },
    });
  }

  async findAllByEnvironmentId(environmentId: string) {
    if (!isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar os acessos à ambiente por ambiente: id inválido',
          meta: {
            target: [environmentId],
            statusCode: 400,
          },
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
      return await this.prisma.envAccess.findMany({
        where: {
          environmentId,
          active: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao buscar os acessos à ambiente por ambiente: registro não encontrado',
            meta: {
              target: [environmentId],
              statusCode: 404,
            },
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
      }
    }
  }

  async updateStatus(id: string, envAccessStatusDto: EnvAccessStatusDto) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao atualizar status de acesso à ambiente: id inválido',
          meta: {
            target: [id],
            statusCode: 400,
          },
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

    const envAccess = await this.prisma.envAccess.findUnique({
      where: {
        id,
      },
    });

    if (!envAccess) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao atualizar status de acesso à ambiente: registro não encontrado',
          meta: {
            target: [id],
            statusCode: 400,
          },
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException(
        "Environment access not found",
        HttpStatus.NOT_FOUND
      );
    }

    try {
      const envAccess = await this.prisma.envAccess.update({
        where: {
          id,
        },
        data: {
          active: envAccessStatusDto.status,
        },
      });

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Status de acesso à ambiente atualizado com sucesso',
          meta: {
            target: [id],
            statusCode: 200,
          },
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error)
      });

      return envAccess;
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao atualizar status de acesso à ambiente: registro não encontrado',
            meta: {
              target: [id],
              statusCode: 400,
            },
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
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao atualizar status de acesso à ambiente: erro interno, verificar os logs de erro do serviço',
            meta: {
              target: [id],
              statusCode: 500,
            },
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);

        throw new HttpException(
          "Can't update environment access",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async update(id: string, updateEnvAccessDto: UpdateEnvAccessDto) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Falha ao atualizar acesso à ambiente: id inválido',
          meta: {
            target: [id],
            statusCode: 400,
          },
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    const envAccess = await this.prisma.envAccess.findFirst({
      where: {
        id, active: true,
      },
    });

    if (!envAccess) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Falha ao atualizar acesso à ambiente: registro não encontrado',
          meta: {
            target: [id],
            statusCode: 404,
          },
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });

      throw new HttpException(
        "Environment access not found",
        HttpStatus.NOT_FOUND
      );
    }

    let startPeriod: Date | undefined;
    if (updateEnvAccessDto.startPeriod) {
      startPeriod = new Date(updateEnvAccessDto.startPeriod);
    }

    let endPeriod: Date | undefined;
    if (updateEnvAccessDto.endPeriod) {
      endPeriod = new Date(updateEnvAccessDto.endPeriod);
    }

    if (startPeriod && endPeriod && startPeriod >= endPeriod) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Falha ao atualizar acesso à ambiente: período de início maior ou igual ao período de término',
          meta: {
            target: [id, {startPeriod: updateEnvAccessDto.startPeriod, endPeriod: updateEnvAccessDto.endPeriod}],
            statusCode: 400,
          },
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });

      throw new HttpException(
        'startPeriod must be less than endPeriod',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      await this.prisma.envAccess.update({
        where: {
          id,
        },
        data: {
          startPeriod,
          endPeriod,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Info',
            message: 'Falha ao atualizar acesso à ambiente: registro não encontrado',
            meta: {
              target: [id],
              statusCode: 404,
            },
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        });

        throw new HttpException(
          'Environment not found',
          HttpStatus.NOT_FOUND
        );
      } else if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Info',
            message: 'Falha ao atualizar acesso à ambiente: registro já existe',
            meta: {
              target: [id],
              statusCode: 400,
            },
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        });

        throw new HttpException(
          'Environment access already exists',
          HttpStatus.BAD_REQUEST
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Info',
            message: 'Falha ao atualizar acesso à ambiente: erro interno, verificar os logs de erro do serviço',
            meta: {
              target: [id],
              statusCode: 500,
            },
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);

        throw new HttpException(
          "Can't update environment access",
          HttpStatus.FORBIDDEN
        );
      }
    }

    if (
      updateEnvAccessDto.accessesToRemove && 
      updateEnvAccessDto.accessesToRemove.length > 0
    ) {
      try {
        for (const accessId of updateEnvAccessDto.accessesToRemove) {
          await this.prisma.access.delete({
            where: {
              id: accessId,
            },
          });
        }
      } catch (error) {
        if (error.code === 'P2025') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao atualizar acesso à ambiente: registro não encontrado',
              meta: {
                target: [id],
                statusCode: 404,
              },
            })
          )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error);
          });

          throw new HttpException(
            'Environment not found',
            HttpStatus.NOT_FOUND
          );
        } else {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao atualizar acesso à ambiente: erro interno, verificar os logs de erro do serviço',
              meta: {
                target: [id],
                statusCode: 500,
              },
            })
          )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error);
          });

          this.errorLogger.error('Falha do sistema (500)', error);

          throw new HttpException(
            "Can't update environment access",
            HttpStatus.FORBIDDEN
          );
        }
      }
    }

    const accesses = []
    if (
      updateEnvAccessDto.accessesToAdd &&
      updateEnvAccessDto.accessesToAdd.length > 0
    ) {
      try {
        for (const access of updateEnvAccessDto.accessesToAdd) {
          const startTime = new Date(
            new Date().toDateString() + ' ' + access.startTime
          );
          const endTime = new Date(
            new Date().toDateString() + ' ' + access.endTime
          );

          if (startTime >= endTime) {
            await lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Acesso de ambiente',
                type: 'Info',
                message: 'Falha ao atualizar acesso à ambiente: horário de início maior ou igual ao horário de término',
                meta: {
                  target: [id, {startTime: access.startTime, endTime: access.endTime}],
                  statusCode: 400,
                },
              })
            )
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error);
            });

            throw new HttpException(
              'startTime must be less than endTime',
              HttpStatus.BAD_REQUEST
            );
          }

          for (const day of access.days) {
            accesses.push(
              await this.prisma.access.create({
                data: {
                  day,
                  startTime,
                  endTime,
                  envAccessId: envAccess.id, 
                }
              })
            );
          }
        }
      } catch (error) {
        if (error.code === 'P2025') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao atualizar acesso à ambiente: registro não encontrado',
              meta: {
                target: [id],
                statusCode: 404,
              },
            })
          )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error);
          });

          throw new HttpException(
            'Environment not found',
            HttpStatus.NOT_FOUND
          );
        } else if (error.code === 'P2002') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao atualizar acesso à ambiente: registro já existe',
              meta: {
                target: [id],
                statusCode: 400,
              },
            })
          )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error);
          });

          throw new HttpException(
            'Environment access already exists',
            HttpStatus.BAD_REQUEST
          );
        } else {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao atualizar acesso à ambiente: erro interno, verificar os logs de erro do serviço',
              meta: {
                target: [id],
                statusCode: 500,
              },
            })
          )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error);
          });

          this.errorLogger.error('Falha do sistema (500)', error);

          throw new HttpException(
            "Can't update environment access",
            HttpStatus.FORBIDDEN
          );
        }
      }
    }
  }

  async remove(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Falha ao remover acesso à ambiente: id inválido',
          meta: {
            target: [id],
            statusCode: 400,
          },
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    const envAccess = await this.prisma.envAccess.findFirst({
      where: {
        id, active: true,
      },
    });

    if (!envAccess) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Falha ao remover acesso à ambiente: registro não encontrado',
          meta: {
            target: [id],
            statusCode: 404,
          },
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });

      throw new HttpException(
        "Environment access not found",
        HttpStatus.NOT_FOUND
      );
    }

    try {
      const envAccess = await this.prisma.envAccess.delete({
        where: {
          id,
          active: true,
        }
      });

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Acesso à ambiente removido com sucesso',
          meta: {
            target: [id],
            statusCode: 200,
          },
        })
      )

      return envAccess;
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Info',
            message: 'Falha ao remover acesso à ambiente: registro não encontrado',
            meta: {
              target: [id],
              statusCode: 404,
            },
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        });

        throw new HttpException(
          'Environment not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Info',
            message: 'Falha ao remover acesso à ambiente: erro interno, verificar os logs de erro do serviço',
            meta: {
              target: [id],
              statusCode: 500,
            },
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);

        throw new HttpException(
          "Can't remove environment access",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }
}
