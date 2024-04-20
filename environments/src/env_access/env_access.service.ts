import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEnvAccessDto } from './dto/create-env_access.dto';
import { UpdateEnvAccessDto } from './dto/update-env_access.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { isUUID } from 'class-validator';
import { EnvAccessStatusDto } from './dto/status-env_access.dto';
import { environment_user_access_control, environment_user } from '@prisma/client';
import { AuditLogService } from 'src/logs/audit-log.service';

@Injectable()
export class EnvAccessService {
  private readonly verifyRoleEndpoint = `${process.env.USERS_SERVICE_URL}/roles/verify`
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly errorLogger = new Logger()

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly auditLogService: AuditLogService,
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
          if (error.response.data.statusCode === 400) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Acesso de ambiente',
                type: 'Error',
                message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente, id inválido',
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
                message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente, usuário não encontrado',
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
                message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente, erro interno verificar logs de erro do serviço',
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
          message: 'Falha ao verificar papel de usuário na criação de acesso à ambiente, usuário não é um frequentador',
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
          message: 'Falha ao buscar paridade em ambiente na criação de gestor de ambiente, usuário é um gestor ativo',
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
          message: 'Falha ao verificar período de acesso na criação de acesso à ambiente, período de início maior ou igual ao período de término',
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

    let envAccess: environment_user;
    try {
      envAccess = await this.prisma.environment_user.create({
        data: {
          user_name: createEnvAccessDto.userName,
          user_id: createEnvAccessDto.userId,
          environment_id: createEnvAccessDto.environmentId,
          start_period: startPeriod,
          end_period: endPeriod,
          created_by: createEnvAccessDto.requestUserId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao criar acesso à ambiente, conflito com registro existente',
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
            message: 'Falha ao criar acesso à ambiente, registro não encontrado',
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
            message: 'Falha ao criar acesso à ambiente, chave duplicada',
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
            message: 'Falha ao criar acesso à ambiente, erro interno verificar logs de erro do serviço',
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

    const accesses: environment_user_access_control[] = [];
    for (const access of createEnvAccessDto.access) {
      const startTime = new Date('1970-01-01T' + access.startTime);
      const endTime = new Date('1970-01-01T' + access.endTime);

      if (startTime >= endTime) {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao criar acesso à ambiente, horário de início maior ou igual ao horário de término',
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
          await this.prisma.environment_user.delete({
            where: {
              id: envAccess.id,
            },
          });          
        } catch (error) {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao deletar acesso à ambiente durante cancelamento de sua criação, erro interno verificar logs de erro do serviço',
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
            await this.prisma.environment_user_access_control.create({
              data: {
                day,
                start_time: startTime,
                end_time: endTime,
                environment_user_id: envAccess.id, 
              }
            })
          );
        }
      } catch (error) {
        await this.prisma.environment_user_access_control.delete({
          where: {
            id: envAccess.id,
          },
        });

        if (error.code === 'P2002') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao criar acesso à ambiente, conflito com registro existente',
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
              message: 'Falha ao criar acesso à ambiente, registro não encontrado',
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
              message: 'Falha ao criar acesso à ambiente, chave duplicada',
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
              message: 'Falha ao criar acesso à ambiente, erro interno verificar logs de erro do serviço',
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

    this.sendLogWhenEnvironmentAccessIsCreated(
      createEnvAccessDto.userId,
      createEnvAccessDto.requestUserId,
      environmentId,
      {
        createEnvAccessDto,
      },
    );

    return {
      ...envAccess,
      accesses,
    };
  }

  async sendLogWhenEnvironmentAccessIsCreated(
    userId: string,
    created_by: string,
    environmentId: string,
    meta?: object,
  ) {
    const user = await this.findUserForLog(userId);
    const created_by_user = await this.findUserForLog(created_by);
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
      message: `${created_by_user.name} vinculou ${user.name} como frequentador no ambiente ${environment.name}`,
      meta: meta,
    });
  }

  async findParity(createEnvAccessDto: CreateEnvAccessDto) {
    const startPeriod = new Date(createEnvAccessDto.startPeriod);
    const endPeriod = new Date(createEnvAccessDto.endPeriod);

    if (startPeriod >= endPeriod) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao verificar período de acesso na criação de acesso à ambiente, período de início maior ou igual ao período de término',
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
            message: 'Falha ao buscar paridade de acesso à ambiente, horário de início maior ou igual ao horário de término',
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

      const envAccesses = await this.prisma.environment_user.findMany({
        where: {
          user_id: createEnvAccessDto.userId,
          active: true,
          start_period: {
            lte: startPeriod,
          },
          end_period: {
            gte: endPeriod,
          },
          NOT: {
            environment_id: createEnvAccessDto.environmentId,
          },
          environment_user_access_control: {
            some: {
              day: {
                in: access.days,
              },
              OR: [
                {
                  start_time: {
                    lte: startTime,
                  },
                  end_time: {
                    gte: startTime,
                  },
                },
                {
                  start_time: {
                    lte: endTime,
                  },
                  end_time: {
                    gte: endTime,
                  },
                },
                {
                  start_time: {
                    gte: startTime,
                  },
                  end_time: {
                    lte: endTime,
                  },
                },
              ],
            },
          },
        },
        select: {
          start_period: true,
          end_period: true,
          environment_user_access_control: {
            select: {
              day: true,
              start_time: true,
              end_time: true,
            }
          }
        }
      });

      parity.push(envAccesses);
    }

    return parity;
  }

  async findAll(skip?: number, take?: number) {
    return await this.prisma.environment_user.findMany({
      where: {
        active: true,
      },
      skip,
      take,
    });
  }

  async getEnvironmentUserData(userId: string, environmentId: string) {
    const data = await this.prisma.environment_user.findFirst({
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
        },
        environment_user_access_control: {
          select: {
            day: true,
          }
        }
      },
    })

    if (!data) {
      throw new HttpException(
        'Environment user not found',
        HttpStatus.NOT_FOUND
      );
    }

    return {
      name: data.environment.name,
      environmentUserId: data.id,
      latitude: data.environment.latitude,
      longitude: data.environment.longitude,
      days: data.environment_user_access_control.map((access) => access.day)
    }
  }

  async getEnvironmentUserAccess(userId: string) {
    try {
      const envsUser = await this.prisma.environment_user.findMany({
        where: {
          user_id: userId,
          active: true,
        },
        select: {
          start_period: true,
          end_period: true,
          active: true,
          environment: {
            select: {
              name: true
            }
          },
          environment_user_access_control: {
            select: {
              day: true,
              start_time: true,
              end_time: true,
              no_access_restrict: true
            }
          }
        },
      })

      return envsUser.map(envUser => {
        return {
          name: envUser.environment.name,
          startPeriod: envUser.start_period,
          endPeriod: envUser.end_period,
          active: envUser.active,
          environment_user_access_control: envUser.environment_user_access_control
        }
      })
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

  async hasEnvManagerOnEnv(userId: string, environmentId: string) {
    if (!isUUID(userId) || !isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar conflito de usuário gestor em ambiente, id inválido',
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

    const envManager = await this.prisma.environment_manager.findFirst({
      where: { 
        user_id: userId, 
        environment_id: environmentId,
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
          message: 'Falha ao verificar acesso de usuário em ambiente, id inválido',
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

    const envManager = await this.prisma.environment_manager.findFirst({
      where: { 
        user_id: userId, 
        environment_id: environmentId
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
    const environmentUser = await this.prisma.environment_user.findFirst({
      where: {
        user_id: userId,
        environment_id: environmentId,
        active: true,
      },
      include: {
        environment_user_access_control: true,
        environment: {
          select: {
            name: true,
          }
        }
      }
    });

    if (!environmentUser) {
      return { access: false };
    }

    const response = { access: false, environmentName: environmentUser.environment.name, environmentId: environmentUser.environment_id }
    const currentDate = new Date();

    const startPeriod = new Date(environmentUser.start_period);
    startPeriod.setHours(startPeriod.getHours() - 3);
    const endPeriod = new Date(environmentUser.end_period);
    endPeriod.setHours(endPeriod.getHours() - 3);

    const currentDateLess3Hours = new Date(currentDate);
    currentDateLess3Hours.setHours(currentDateLess3Hours.getHours() - 3);

    if (startPeriod <= currentDateLess3Hours && endPeriod >= currentDateLess3Hours) {
      for (const accessControl of environmentUser.environment_user_access_control) {
        if (
          accessControl.day !== currentDate.getDay() ||
          accessControl.active === false
        ) {
          continue;
        }

        const startTime = accessControl.start_time.toLocaleTimeString();
        const endTime = accessControl.end_time.toLocaleTimeString();
        const currentTime = currentDate.toLocaleTimeString();
        
        if (startTime <= currentTime && endTime >= currentTime) {
          response.access = true;
          console.log('Acesso permitido');
          
          break;
        }
      }
    }
    
    return response;
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao buscar acesso à ambiente, id inválido',
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
      return await this.prisma.environment_user.findFirstOrThrow({
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
            message: 'Falha ao buscar acesso à ambiente, registro não encontrado',
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
            message: 'Falha ao buscar acesso à ambiente, erro interno verificar logs de erro do serviço',
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
          message: 'Falha ao buscar os acessos à ambiente de frequentador, id inválido',
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

    return await this.prisma.environment_user.findMany({
      where: {
        user_id: userId,
        active: true,
      },
    });
  }

  async findAllInactives() {
    return await this.prisma.environment_user.findMany({
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
          message: 'Falha ao buscar os acessos à ambiente por ambiente, id inválido',
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
      return await this.prisma.environment_user.findMany({
        where: {
          environment_id: environmentId,
          active: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao buscar os acessos à ambiente por ambiente, registro não encontrado',
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
          message: 'Falha ao atualizar status de acesso à ambiente, id inválido',
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

    const envAccess = await this.prisma.environment_user.findUnique({
      where: {
        id,
      },
    });

    if (!envAccess) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao atualizar status de acesso à ambiente, registro não encontrado',
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
      const envAccess = await this.prisma.environment_user.update({
        where: {
          id,
        },
        data: {
          active: envAccessStatusDto.status,
        },
      });

      this.sendLogWhenEnvironmentAccessStatusIsUpdated(
        envAccess.user_id,
        envAccessStatusDto.requestUserId,
        envAccess.environment_id,
        envAccessStatusDto.status,
        {
          envAccessStatusDto,
        },
      );

      return envAccess;
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao atualizar status de acesso à ambiente, registro não encontrado',
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
            message: 'Falha ao atualizar status de acesso à ambiente, erro interno verificar os logs de erro do serviço',
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

  async sendLogWhenEnvironmentAccessStatusIsUpdated(
    userId: string,
    created_by: string,
    environmentId: string,
    status: boolean,
    meta?: object,
  ) {
    const user = await this.findUserForLog(userId);
    const created_by_user = await this.findUserForLog(created_by);
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
      message: `${created_by_user.name} atualizou status do vinculo do frequentador ${user.name} no ambiente ${environment.name} para ${status ? 'ativo' : 'inativo'}`,
      meta: meta,
    });
  }

  async update(id: string, updateEnvAccessDto: UpdateEnvAccessDto) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao atualizar acesso à ambiente, id inválido',
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

    const envAccess = await this.prisma.environment_user.findFirst({
      where: {
        id, active: true,
      },
    });

    if (!envAccess) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Error',
          message: 'Falha ao atualizar acesso à ambiente, registro não encontrado',
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
          type: 'Error',
          message: 'Falha ao atualizar acesso à ambiente, período de início maior ou igual ao período de término',
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
      await this.prisma.environment_user.update({
        where: {
          id,
        },
        data: {
          start_period: startPeriod,
          end_period: endPeriod,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Error',
            message: 'Falha ao atualizar acesso à ambiente, registro não encontrado',
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
            message: 'Falha ao atualizar acesso à ambiente, conflito com registro existente',
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
            message: 'Falha ao atualizar acesso à ambiente, erro interno verificar os logs de erro do serviço',
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
          await this.prisma.environment_user_access_control.delete({
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
              message: 'Falha ao atualizar acesso à ambiente, registro não encontrado',
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
              message: 'Falha ao atualizar acesso à ambiente, erro interno verificar os logs de erro do serviço',
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
                message: 'Falha ao atualizar acesso à ambiente, horário de início maior ou igual ao horário de término',
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
              await this.prisma.environment_user_access_control.create({
                data: {
                  day,
                  start_time: startTime,
                  end_time: endTime,
                  environment_user_id: envAccess.id, 
                }
              })
            );
          }
        }

        this.sendLogWhenEnvironmentAccessIsUpdated(
          envAccess.user_id,
          envAccess.created_by,
          envAccess.environment_id,
          {
            updateEnvAccessDto,
          },
        );
      } catch (error) {
        if (error.code === 'P2025') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Acesso de ambiente',
              type: 'Error',
              message: 'Falha ao atualizar acesso à ambiente, registro não encontrado',
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
              message: 'Falha ao atualizar acesso à ambiente, conflito com registro existente',
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
              message: 'Falha ao atualizar acesso à ambiente, erro interno verificar os logs de erro do serviço',
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

  async sendLogWhenEnvironmentAccessIsUpdated(
    userId: string,
    createdBy: string,
    environmentId: string,
    meta?: object,
  ) {
    const user = await this.findUserForLog(userId);
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
      message: `${created_by_user.name} atualizou o vinculo do frequentador ${user.name} no ambiente ${environment.name}`,
      meta: meta,
    });
  }

  async remove(id: string, requestUserId?: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Falha ao remover acesso à ambiente, id inválido',
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

    const envAccess = await this.prisma.environment_user.findFirst({
      where: {
        id, active: true,
      },
    });

    if (!envAccess) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso de ambiente',
          type: 'Info',
          message: 'Falha ao remover acesso à ambiente, registro não encontrado',
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
      const envAccess = await this.prisma.environment_user.delete({
        where: {
          id,
          active: true,
        }
      });

      this.sendLogWhenEnvironmentAccessIsRemoved(
        envAccess.user_id,
        requestUserId,
        envAccess.environment_id,
        {
          envAccess,
        },
      );

      return envAccess;
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Acesso de ambiente',
            type: 'Info',
            message: 'Falha ao remover acesso à ambiente, registro não encontrado',
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
            message: 'Falha ao remover acesso à ambiente, erro interno verificar os logs de erro do serviço',
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

  async sendLogWhenEnvironmentAccessIsRemoved(
    userId: string,
    createdBy: string,
    environmentId: string,
    meta?: object,
  ) {
    const user = await this.findUserForLog(userId);
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
      message: `${created_by_user.name} removeu acesso de ${user.name} no ambiente ${environment.name}`,
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
