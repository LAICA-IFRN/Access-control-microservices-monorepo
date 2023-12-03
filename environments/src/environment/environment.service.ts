import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUUID } from 'class-validator';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AccessLogService } from 'src/logs/access-log.service';
import { AccessConstants } from 'src/logs/access-constants';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { FindAllDto } from './dto/find-all.dto';

@Injectable()
export class EnvironmentService {
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  
  private readonly verifyRoleEndpoint = `${process.env.USERS_SERVICE_URL}/roles/verify`
  private readonly getEsp8266Endpoint = process.env.DEVICES_SERVICE_URL
  private readonly errorLogger = new Logger()
  
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly accessLogService: AccessLogService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async generateQRCodes()  {
    const environments = await this.prisma.environment.findMany({
      where: {
        active: true
      },
      select: {
        id: true
      }
    })

    environments.forEach(environment => {
      const value = randomUUID();
      const key = environment.id;
      this.cacheService.set(key, value);
    });
  }

  async getQRCode(environmentId: string) {
    const key = environmentId;
    const value = await this.cacheService.get(key);
    return value;
  } 

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    const isAdmin = await lastValueFrom(
      this.httpService.get(this.verifyRoleEndpoint, {
        data: {
          userId: createEnvironmentDto.createdBy,
          roles: ['ADMIN'],
        },
      }).pipe(
        catchError((error) => {
          if (error.response.status === 'ECONNREFUSED') {
            this.errorLogger.error('Falha ao se conectar com o serviço de usuários (500)', error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
          } else if (error.response.data.statusCode === 400) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: "Ambiente",
                type: "Error",
                message: 'Falha ao verificar papel de usuário durante criação de ambiente: id inválido',
                meta: {
                  userId: createEnvironmentDto.createdBy,
                  error: error.response.data.message,
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
                topic: "Ambiente",
                type: "Error",
                message: 'Falha ao verificar papel de usuário durante criação de ambiente: usuário não encontrado',
                meta: {
                  userId: createEnvironmentDto.createdBy,
                  error: error.response.data.message,
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
            this.errorLogger.error('Falha do sistema (500)', error);
            throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }),
      ),
    ).then((response) => response.data);

    if (!isAdmin) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao verificar papel de usuário durante criação de ambiente: usuário não é um admin',
          meta: {
            userId: createEnvironmentDto.createdBy,
            statusCode: 403
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('User is not a admin', HttpStatus.FORBIDDEN);
    }

    try {
      const environment = await this.prisma.environment.create({
        data: {
          name: createEnvironmentDto.name,
          description: createEnvironmentDto.description,
          created_by: createEnvironmentDto.createdBy,
          latitude: createEnvironmentDto.latitude,
          longitude: createEnvironmentDto.longitude,
        },
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Info",
          message: 'Ambiente criado: ' + environment.name || '',
          meta: {
            created_by: environment.created_by,
            environmentId: environment.id
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return environment
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar ambiente: conflito com registro existente',
            meta: {
              createdBy: createEnvironmentDto.createdBy,
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
      } else if(error.code === 'P2025') {

        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar ambiente: admin não encontrado',
            meta: {
              createdBy: createEnvironmentDto.createdBy,
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
          `Admin not found: ${error.meta.target}`,
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              createdBy: createEnvironmentDto.createdBy,
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);

        throw new HttpException(
          "Can't create environment",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async requestRemoteAccess(environmentId: string, esp8266Id: number, remoteAccessType: string, userId: string) {
    if (!isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao solicitar acesso remoto: id de ambiente inválido',
          meta: {
            environmentId,
            userId,
            statusCode: 400
          }
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('Invalid id entry', HttpStatus.BAD_REQUEST);
    }

    const environment = await this.prisma.environment.findFirst({
      where: {
        id: environmentId,
        active: true
      }
    })

    if (!environment) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error", 
          message: 'Falha ao solicitar acesso remoto: ambiente não encontrado',
          meta: {
            environmentId,
            userId,
            statusCode: 404
          }
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      throw new HttpException('Environment not found', HttpStatus.NOT_FOUND);
    }

    const esp8266 = await lastValueFrom(
      this.httpService.get(`${this.getEsp8266Endpoint}/microcontrollers/one/${esp8266Id}`).pipe(
        catchError((error) => {
          if (error.response.status === 'ECONNREFUSED') {
            this.errorLogger.error('Falha ao se conectar com o serviço de dispositivos (500)', error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
          } else if (error.response.data.statusCode === 400) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: "Ambiente",
                type: "Error",
                message: 'Falha ao solicitar acesso remoto: id de dispositivo inválido',
                meta: {
                  environmentId,
                  userId,
                  statusCode: 400
                }
              })
            )
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            });

            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: "Ambiente",
                type: "Error",
                message: 'Falha ao solicitar acesso remoto: dispositivo não encontrado',
                meta: {
                  environmentId,
                  userId,
                  statusCode: 404
                }
              })
            )
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            });

            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            this.errorLogger.error('Falha do sistema (500)', error);
            throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }),
      ),
    ).then((response) => response.data);

    const user = await lastValueFrom(
      this.httpService.get(`${process.env.USERS_SERVICE_URL}/${userId}`)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao se conectar com o serviço de usuários (500)', error);
      throw new HttpException('Internal server error when search user on remote access', HttpStatus.INTERNAL_SERVER_ERROR);
    });

    const key = esp8266.id.toString();
    const cache = { value: true, remoteAccessType, userName: user.name, userId: user.id, environmentName: environment.name, environmentId: environment.id };
    await this.cacheService.set(key, cache); // TODO: alterar o cache para salvar em arquivo em vez de memória

    if (remoteAccessType === 'web') {
      await this.sendAccessLogWhenWebRemoteAccessSuccess(
        environment.name,
        environment.id,
        esp8266.id, 
        user.name,
        user.id
      );
    } else {
      await this.sendAccessLogWhenMobileRemoteAccessSuccess(
        environment.name,
        environment.id,
        esp8266.id, 
        user.name,
        user.id
      );
    }

    return cache;
  }

  async findRemoteAccess(esp8266Id: number) {
    const key = esp8266Id.toString();
    const value = await this.cacheService.get(key);
    await this.cacheService.set(key, { value: false });

    return value;
  }

  async sendAccessLogWhenWebRemoteAccessSuccess(
    environmentName: string, 
    environmentId: string,
    esp8266Id: number,
    userName: string,
    userId: string
  ) {
    

    await this.accessLogService.create(AccessConstants.webRemoteAccessSuccess(
      environmentName,
      userName,
      {
        environmentId,
        esp8266Id,
        userId
      }
    ));
  }

  async sendAccessLogWhenMobileRemoteAccessSuccess(
    environmentName: string, 
    environmentId: string,
    esp8266Id: number,
    userName: string,
    userId: string
  ) {
    

    await this.accessLogService.create(AccessConstants.mobileRemoteAccessSuccess(
      environmentName,
      userName,
      {
        environmentId,
        esp8266Id,
        userId
      }
    ));
  }

  async findAll(findAllDto: FindAllDto) {
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const order = findAllDto.orderBy ? findAllDto.orderBy : {};
    const filter = findAllDto.where ? findAllDto.where : {};

    const [environments, total] = await this.prisma.$transaction([
      this.prisma.environment.findMany({
        skip: previousLenght,
        take: nextLenght,
        orderBy: order,
        where: filter,
        include: {
          environment_user: true,
          environment_manager: true,
          environment_restriction_access: true,
        }
      }),

      this.prisma.environment.count({
        where: filter
      })
    ]);

    return {
      pageSize: findAllDto.pageSize,
      previous: findAllDto.previous,
      next: findAllDto.next,
      total,
      data: environments
    };
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao buscar um ambiente: id inválido',
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

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      return await this.prisma.environment.findFirstOrThrow({
        where: { id, active: true }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao buscar um ambiente: ambiente não encontrado',
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
          "Environment not found",
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao buscar um ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              createdBy: id,
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error);
  
        throw new HttpException(
          "Can't find environment",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async update(id: string, updateEnvironmentDto: UpdateEnvironmentDto) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao atualizar um ambiente: id inválido',
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

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const environment = await this.prisma.environment.update({
        where: { id, active: true },
        data: {
          name: updateEnvironmentDto.name,
          description: updateEnvironmentDto.description
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Info",
          message: 'Ambiente atualizado',
          meta: {
            createdBy: environment.created_by,
            environmentId: environment.id
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return environment
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao atualizar um ambiente: ambiente não encontrado',
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
          `Environment not found: ${error.meta.target}`,
          HttpStatus.NOT_FOUND
        );
      } else if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao atualizar um ambiente: conflito com registro existente',
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
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao atualizar um ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              createdBy: id,
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error)

        throw new HttpException(
          "Can't update environment",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async changeStatus(id: string, status: boolean) {
    if (!isUUID(id)) {
      lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao atualizar o status de ambiente: id inválido',
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

      throw new HttpException(
        'Invalid id entry',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const environment = await this.prisma.environment.update({
        where: { id },
        data: {
          active: status
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Info", 
          message: 'Status de ambiente atualizado: ' + environment.name || '',
          meta: {
            createdBy: environment.created_by,
            environmentId: environment.id,
            status: environment.active
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return environment
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao atualizar o status de ambiente: ambiente não encontrado',
            meta: {
              target: error.meta.target,
              statusCode: 404
            }
          })
        )

        throw new HttpException(
          `Environment not found: ${error.meta.target}`,
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao atualizar o status de ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              adminId: id,
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error)

        throw new HttpException(
          "Can't change environment status",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async remove(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao remover ambiente: id inválido',
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

      throw new HttpException(
        "Invalid id entry",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const environment = await this.prisma.environment.delete({
        where: { id, active: true }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Info",
          message: 'Ambiente removido: ' + environment.name || '',
          meta: {
            createdBy: environment.created_by,
            environmentId: environment.id
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return environment
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao remover ambiente: ambiente não encontrado',
            meta: {
              target: error.meta.target,
              statusCode: 404
            }
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          `Environment not found: ${error.meta.target}`,
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao remover ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              adminId: id,
              context: error,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        this.errorLogger.error('Falha do sistema (500)', error)
        
        throw new HttpException(
          "Can't delete environment",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }
}
