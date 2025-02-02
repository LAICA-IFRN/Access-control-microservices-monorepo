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
// import { Cron, CronExpression } from '@nestjs/schedule';
//import { randomUUID } from 'crypto';
import { FindAllDto } from './dto/find-all.dto';
import { CreateTemporaryAccessDto } from './dto/create-temporary-access.dto';
import { environment_temporary_access, environment_user_access_control } from '@prisma/client';
import { AuditLogService } from 'src/logs/audit-log.service';
import { AuditLogConstants } from 'src/providers/audit-log/audit-log.constants';
import { MobileGetEnvironmentsDto } from './dto/mobile-get-environments.dto';
import { AuditConstants } from 'src/logs/audit-contants';

@Injectable()
export class EnvironmentService {
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`

  private readonly verifyRoleEndpoint = `${process.env.USERS_SERVICE_URL}/roles/verify`
  private readonly getUserEndpoint = `${process.env.USERS_SERVICE_URL}/`
  private readonly getEsp8266Endpoint = process.env.DEVICES_SERVICE_URL
  private readonly errorLogger = new Logger()

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly accessLogService: AccessLogService,
    private readonly auditLogService: AuditLogService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) { }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  // async generateQRCodes()  {
  //   const environments = await this.prisma.environment.findMany({
  //     where: {
  //       active: true
  //     },
  //     select: {
  //       id: true
  //     }
  //   })

  //   environments.forEach(environment => {
  //     const value = randomUUID();
  //     const key = environment.id;
  //     this.cacheService.set(key, value);
  //   });
  // }

  // async getQRCode(environmentId: string) {
  //   const key = environmentId;
  //   const value = await this.cacheService.get(key);
  //   return value;
  // } 

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    const user: any = await lastValueFrom(
      this.httpService.get(this.getUserEndpoint + createEnvironmentDto.requestUserId).pipe(
        catchError((error) => {
          if (error.response.status === 'ECONNREFUSED') {
            this.errorLogger.error('Falha ao se conectar com o serviço de usuários (500)', error);
            throw new HttpException('Users service out', HttpStatus.INTERNAL_SERVER_ERROR);
          } else if (error.response.data.statusCode === 400) {
            this.auditLogService.create(
              AuditLogConstants.createEnvironmentVerifyRolesFailedById({
                userId: createEnvironmentDto.requestUserId,
                error: error.response.data.message,
                statusCode: 400
              })
            );

            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            this.auditLogService.create(
              AuditLogConstants.createEnvironmentVerifyRolesFailedByUser({
                userId: createEnvironmentDto.requestUserId,
                error: error.response.data.message,
                statusCode: 404
              })
            )

            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            this.errorLogger.error('Falha do sistema (500)', error);
            throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }),
      ),
    ).then((response) => response.data);

    if (!user || user?.user_role?.lenght > 1 || user?.user_role[0]?.role_id !== 1) {
      this.auditLogService.create(
        AuditLogConstants.createEnvironmentVerifyRolesFailedByRole({
          userId: createEnvironmentDto.requestUserId,
          error: 'Usuário não é um admin',
          statusCode: 403
        })
      )

      throw new HttpException('User is not a admin', HttpStatus.FORBIDDEN);
    }

    try {
      const environment = await this.prisma.environment.create({
        data: {
          name: createEnvironmentDto.name,
          description: createEnvironmentDto.description,
          created_by: createEnvironmentDto.requestUserId,
          user_name: user.name,
          latitude: createEnvironmentDto.latitude,
          longitude: createEnvironmentDto.longitude,
        },
      })

      this.sendLogWhenEnvironmentCreated(
        environment.name,
        environment.id,
        createEnvironmentDto.requestUserId,
        createEnvironmentDto
      );

      return environment
    } catch (error) {
      if (error.code === 'P2002') {
        this.auditLogService.create(
          AuditLogConstants.verifyRolesFailedByEnvironment({
            createdBy: createEnvironmentDto.requestUserId,
            target: error.meta.target,
            statusCode: 409
          })
        )

        throw new HttpException(
          `Already exists: ${error.meta.target}`,
          HttpStatus.CONFLICT
        );
      } else if (error.code === 'P2025') {

        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar ambiente, usuário não encontrado',
            meta: {
              createdBy: createEnvironmentDto.requestUserId,
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
          `User not found: ${error.meta.target}`,
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar ambiente, erro interno verificar logs de erro do serviço',
            meta: {
              createdBy: createEnvironmentDto.requestUserId,
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

  async sendLogWhenEnvironmentCreated(environmentName: string, environmentId: string, userId: string, createEnvironmentDto: CreateEnvironmentDto) {
    const user = await this.findUserForLog(userId);

    await this.auditLogService.create(
      AuditLogConstants.createEnvironmentSuccess(
        user.name,
        environmentName,
        {
          environmentId,
          userId,
          data: createEnvironmentDto
        }
      )
    );
  }

  async createTemporaryAccess(createTemporaryAccessDto: CreateTemporaryAccessDto) {
    const isAdmin = await lastValueFrom(
      this.httpService.get(this.verifyRoleEndpoint, {
        data: {
          userId: createTemporaryAccessDto.userId,
          roles: ['ADMIN'],
        },
      }).pipe(
        catchError((error) => {
          if (error.response.status === 'ECONNREFUSED') {
            this.errorLogger.error('Falha ao se conectar com o serviço de usuários (500)', error);
            throw new HttpException('Users service out', HttpStatus.INTERNAL_SERVER_ERROR);
          } else if (error.response.data.statusCode === 400) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: "Ambiente",
                type: "Error",
                message: 'Falha ao verificar papel de usuário durante criação de acesso temporário, id inválido',
                meta: {
                  userId: createTemporaryAccessDto.userId,
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
                message: 'Falha ao verificar papel de usuário durante criação de acesso temporário, usuário não encontrado',
                meta: {
                  userId: createTemporaryAccessDto.userId,
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

    if (isAdmin) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Um usuário admin não pode ter acesso temporário',
          meta: {
            userId: createTemporaryAccessDto.userId,
            statusCode: 403
          }
        })
      )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

      throw new HttpException('An admin can not have temporary access', HttpStatus.FORBIDDEN);
    }

    const startPeriod = new Date(createTemporaryAccessDto.startPeriod);
    const endPeriod = new Date(createTemporaryAccessDto.endPeriod);

    if (startPeriod > endPeriod) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'A data de início do período não pode ser maior que a data de fim',
          meta: {
            userId: createTemporaryAccessDto.userId,
            statusCode: 400
          }
        })
      )
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

      throw new HttpException('Start period can not be greater than end period', HttpStatus.BAD_REQUEST);
    }

    let tempAccess: environment_temporary_access;
    try {
      tempAccess = await this.prisma.environment_temporary_access.create({
        data: {
          start_period: startPeriod,
          end_period: endPeriod,
          description: createTemporaryAccessDto.description,
          created_by: createTemporaryAccessDto.requestUserId,
          user_name: createTemporaryAccessDto.userName,
          environment_id: createTemporaryAccessDto.environmentId,
          user_id: createTemporaryAccessDto.userId,
        }
      })
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: "Falha ao criar acesso temporário, conflito com registro existente",
            meta: {
              createdBy: createTemporaryAccessDto.requestUserId,
              target: error.meta.target,
              statusCode: 409
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao criar log', error);
          });

        throw new HttpException(
          `Already exists: ${error.meta.target}`,
          HttpStatus.CONFLICT
        );
      }
    }

    const accesses: environment_user_access_control[] = [];
    for (const access of createTemporaryAccessDto.access) {
      const startTime = new Date('1970-01-01T' + access.startTime);
      const endTime = new Date('1970-01-01T' + access.endTime);

      if (startTime > endTime) {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'A hora de início do período não pode ser maior que a hora de fim',
            meta: {
              userId: createTemporaryAccessDto.userId,
              statusCode: 400
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao criar log', error);
          });

        try {
          await this.prisma.environment_temporary_access.delete({
            where: {
              id: tempAccess.id
            }
          })
        } catch (error) {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: "Ambiente",
              type: "Error",
              message: 'Falha ao remover acesso temporário durante cancelamento de sua criação, erro interno, verificar logs de erro do serviço',
              meta: {
                userId: createTemporaryAccessDto.userId,
                statusCode: 500
              }
            })
          )
          this.errorLogger.error('Falha ao remover acesso temporário', error);
        }

        throw new HttpException('Start time can not be greater than end time', HttpStatus.BAD_REQUEST);
      }

      try {
        for (const day of access.days) {
          const accessControl = await this.prisma.environment_user_access_control.create({
            data: {
              day: day,
              start_time: startTime,
              end_time: endTime,
              no_access_restrict: access.noAccessRestrict,
              environment_temporary_access_id: tempAccess.id
            }
          })

          accesses.push(accessControl);
        }
      } catch (error) {
        await this.prisma.environment_temporary_access.delete({
          where: {
            id: tempAccess.id
          }
        })

        if (error.code === 'P2002') {
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: "Ambiente",
              type: "Error",
              message: 'Falha ao criar acesso temporário, conflito com registro existente',
              meta: {
                createdBy: createTemporaryAccessDto.requestUserId,
                target: error.meta.target,
                statusCode: 409
              }
            })
          )
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
              message: 'Falha ao criar acesso temporário, erro interno verificar logs de erro do serviço',
              meta: {
                createdBy: createTemporaryAccessDto.requestUserId,
                context: error,
                statusCode: 403
              }
            })
          )
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            });

          this.errorLogger.error('Falha do sistema (500)', error);

          throw new HttpException(
            "Can't create temporary access",
            HttpStatus.FORBIDDEN
          );
        }
      }
    }

    this.sendLogWhenTemporaryAccessCreated(
      tempAccess.environment_id,
      tempAccess.user_name,
      tempAccess.user_id,
      createTemporaryAccessDto
    )

    return {
      ...tempAccess,
      accesses
    }
  }

  async sendLogWhenTemporaryAccessCreated(
    environmentId: string,
    userName: string,
    userId: string,
    createTemporaryAccessDto: CreateTemporaryAccessDto
  ) {
    const createdByUser: any = await this.findUserForLog(createTemporaryAccessDto.requestUserId);
    const environment = await this.prisma.environment.findFirst({
      where: { id: environmentId }
    })

    await this.auditLogService.create(
      AuditLogConstants.createTemporaryAccessSuccess(
        userName,
        environment.name,
        createdByUser.name,
        {
          environmentId,
          userId,
          data: createTemporaryAccessDto
        }
      )
    );
  }

  async requestRemoteAccess(environmentId: string, esp8266Id: number, remoteAccessType: string, userId: string) {
    if (!isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao solicitar acesso remoto, id de ambiente inválido',
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
          message: 'Falha ao solicitar acesso remoto, ambiente não encontrado',
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

    console.log('environment', environment);


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
                message: 'Falha ao solicitar acesso remoto, id de dispositivo inválido',
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
                message: 'Falha ao solicitar acesso remoto, dispositivo não encontrado',
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
    await this.cacheService.set(key, cache);

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

    return value === undefined ? { value: false } : value;
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

  async dashboardConsultData() {
    const totalEnvironments = await this.prisma.environment.count();
    const environmentsCreatedAtLastWeek = await this.prisma.environment.count({
      where: {
        created_at: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    return {
      totalEnvironments,
      environmentsCreatedAtLastWeek
    }
  }

  async findAll(findAllDto: FindAllDto) {
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const environmentFieldsToSelect = {
      id: true,
      name: true,
      description: true,
      created_at: true,
      user_name: true,
      latitude: true,
      longitude: true,
      environment_user: {
        select: {
          user_name: true
        },

      },
      environment_manager: {
        select: {
          user_name: true
        }
      },
      environment_restriction_access: true
    }

    try {
      const [environments, total] = await this.prisma.$transaction([
        this.prisma.environment.findMany({
          skip: previousLenght,
          take: nextLenght,
          orderBy: findAllDto.orderBy ? findAllDto.orderBy : { created_at: 'desc' },
          where: findAllDto.where,
          select: findAllDto.select || environmentFieldsToSelect
        }),

        this.prisma.environment.count({
          where: findAllDto.where,
        })
      ]);

      return {
        pageSize: findAllDto.pageSize,
        previous: findAllDto.previous,
        next: findAllDto.next,
        total,
        data: environments
      };
    } catch (error) {
      console.log('error', error);

      this.auditLogService.create(AuditConstants.findAllError({ target: 'users', statusCode: 500 }))
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getEnvironmentForMobile(body: MobileGetEnvironmentsDto) {
    const envs: any[] = [];

    if (body.roleKeys.includes(1)) {
      try {
        const environments = await this.prisma.environment.findMany({
          where: {
            active: true,
          },
          select: {
            user_name: true,
            created_at: true,
            description: true,
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            environment_user: {
              select: {
                user_name: true
              }
            },
            environment_manager: {
              select: {
                user_name: true
              }
            },
            environment_restriction_access: true
          }
        });

        environments.forEach(environment => {
          envs.push({
            envType: 1,
            created_by: environment.user_name,
            created_at: environment.created_at,
            description: environment.description,
            id: environment.id,
            latitude: environment.latitude,
            longitude: environment.longitude,
            name: environment.name,
            frequenters: environment.environment_user,
            managers: environment.environment_manager,
            restrictions: environment.environment_restriction_access
          })
        })
      } catch (error) {
        this.errorLogger.error('Falha do sistema ao buscar ambientes', error);
        throw new HttpException('Falha ao buscar ambientes, consultar logs de erro no projeto', HttpStatus.UNPROCESSABLE_ENTITY);
      }
    } else {
      if (body.roleKeys.includes(2)) {
        try {
          const envsUser = await this.prisma.environment_user.findMany({
            where: {
              user_id: body.userId,
            },
            select: {
              user_name: true,
              start_period: true,
              created_at: true,
              end_period: true,
              active: true,
              environment: {
                select: {
                  latitude: true,
                  longitude: true,
                  id: true,
                  name: true,
                  user_name: true,
                  description: true
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

          envsUser.forEach(envUser => {
            envs.push({
              envType: 2,
              id: envUser.environment.id,
              created_by: envUser.environment.user_name,
              name: envUser.environment.name,
              latitude: envUser.environment.latitude,
              longitude: envUser.environment.longitude,
              description: envUser.environment.description,
              created_at: envUser.created_at,
              startPeriod: envUser.start_period,
              endPeriod: envUser.end_period,
              active: envUser.active,
              environment_user_access_control: envUser.environment_user_access_control
            })
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
      if (body.roleKeys.includes(3)) {
        try {
          const environments = await this.prisma.environment.findMany({
            where: {
              active: true,
              environment_manager: {
                some: {
                  user_id: body.userId
                }
              }
            },
            select: {
              id: true,
              latitude: true,
              longitude: true,
              user_name: true,
              name: true,
              created_at: true,
              created_by: true,
              description: true,
              environment_user: {
                select: {
                  user_name: true
                }
              },
              environment_manager: {
                where: {
                  NOT: {
                    user_id: body.userId
                  }
                },
                select: {
                  user_name: true
                },
              },
              environment_restriction_access: true
            }
          });

          environments.forEach(environment => {
            envs.push({
              envType: 3,
              id: environment.id,
              name: environment.name,
              latitude: environment.latitude,
              longitude: environment.longitude,
              created_at: environment.created_at,
              created_by: environment.user_name,
              description: environment.description,
              frequenters: environment.environment_user,
              managers: environment.environment_manager,
              restrictions: environment.environment_restriction_access
            })
          })
        } catch (error) {
          if (error.code === 'P2025') {
            throw new HttpException(
              'Environment user not found',
              HttpStatus.NOT_FOUND
            );
          } else {
            this.errorLogger.error('Falha do sistema ao buscar ambientes', error);
            throw new HttpException(
              "Can't find environments for manager",
              HttpStatus.UNPROCESSABLE_ENTITY
            );
          }
        }
      }
    }

    return envs;
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao buscar um ambiente, id inválido',
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
            message: 'Falha ao buscar um ambiente, erro interno verificar logs de erro do serviço',
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
          message: 'Falha ao atualizar um ambiente, id inválido',
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

      this.sendLogWhenEnvironmentUpdated(
        environment.name,
        environment.id,
        updateEnvironmentDto.requestUserId,
        updateEnvironmentDto
      );

      return environment
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao atualizar um ambiente, ambiente não encontrado',
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
            message: 'Falha ao atualizar um ambiente, conflito com registro existente',
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
            message: 'Falha ao atualizar um ambiente, erro interno verificar logs de erro do serviço',
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

  async sendLogWhenEnvironmentUpdated(environmentName: string, environmentId: string, userId: string, updateEnvironmentDto: UpdateEnvironmentDto) {
    const user = await this.findUserForLog(userId);

    await this.auditLogService.create(
      AuditLogConstants.updateEnvironmentSuccess(
        user.name,
        environmentName,
        {
          environmentId,
          userId,
          data: updateEnvironmentDto
        }
      )
    );
  }

  async changeStatus(id: string, status: boolean, requestUserId: string) {
    if (!isUUID(id)) {
      lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao atualizar o status de ambiente, id inválido',
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

      this.sendLogWhenEnvironmentStatusChanged(
        environment.name,
        environment.id,
        requestUserId,
        status
      );

      return environment
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao atualizar o status de ambiente, registro não encontrado',
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
            message: 'Falha ao atualizar o status de ambiente, erro interno verificar logs de erro do serviço',
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

  async sendLogWhenEnvironmentStatusChanged(environmentName: string, environmentId: string, userId: string, status: boolean) {
    const user = await this.findUserForLog(userId);

    await this.auditLogService.create(
      AuditLogConstants.changeEnvironmentStatusSuccess(
        user.name,
        environmentName,
        status,
        {
          environmentId,
          userId,
          status
        }
      )
    );
  }

  async remove(id: string, requestUserId: string) {
    if (!isUUID(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Error",
          message: 'Falha ao remover ambiente, id inválido',
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

      this.sendLogWhenEnvironmentRemoved(
        environment.name,
        environment.id,
        requestUserId
      );

      return environment
    } catch (error) {
      if (error.response.status === 'ECONNREFUSED') {
        this.errorLogger.error('Falha ao se conectar com o serviço de usuários (500)', error);
        throw new HttpException('Serviço fora do ar', HttpStatus.INTERNAL_SERVER_ERROR);
      } else if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao remover ambiente, ambiente não encontrado',
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
            message: 'Falha ao remover ambiente, erro interno, verificar logs de erro do serviço',
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

  async sendLogWhenEnvironmentRemoved(environmentName: string, environmentId: string, userId: string) {
    const user = await this.findUserForLog(userId);

    await this.auditLogService.create(
      AuditLogConstants.removeEnvironmentSuccess(
        user.name,
        environmentName,
        {
          environmentId,
          userId
        }
      )
    );
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
