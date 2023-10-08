import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUUID } from 'class-validator';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EnvironmentService {
  private readonly createAuditLogUrl = 'http://localhost:6004/service/audit/logs'
  private readonly errorLogger = new Logger()

  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    @Inject("AUDIT_SERVICE") private readonly auditService: ClientProxy
  ) {} 

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    const verifyRoleEndpoint = 'http://localhost:6001/service/users/roles/verify';

    const isAdmin = await lastValueFrom(
      this.httpService.get(verifyRoleEndpoint, {
        data: {
          userId: createEnvironmentDto.adminId,
          role: 'ADMIN',
        },
      }).pipe(
        catchError((error) => {
          console.log(error);
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
                  userId: createEnvironmentDto.adminId,
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
                  userId: createEnvironmentDto.adminId,
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
            userId: createEnvironmentDto.adminId,
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
          createdBy: createEnvironmentDto.adminId
        },
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Ambiente",
          type: "Info",
          message: 'Ambiente criado: ' + environment.name || '',
          meta: {
            createdBy: environment.createdBy,
            environmentId: environment.id
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        this.errorLogger.error('Falha ao criar log', error);
      });

      return environment
    } catch (error) {
      console.log(error);
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Ambiente",
            type: "Error",
            message: 'Falha ao criar ambiente: conflito com registro existente',
            meta: {
              adminId: createEnvironmentDto.adminId,
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
              adminId: createEnvironmentDto.adminId,
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
              adminId: createEnvironmentDto.adminId,
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

  async findAll(skip: number, take: number) {
    const [environments, count] = await this.prisma.$transaction([
      this.prisma.environment.findMany({
        where: {
          active: true
        },
        skip,
        take
      }),
      
      this.prisma.environment.count({
        where: {
          active: true
        }
      })
    ])

    const pages = Math.ceil(count / take)

    return {
      environments,
      count,
      pages
    }
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
            createdBy: environment.createdBy,
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
            createdBy: environment.createdBy,
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
            createdBy: environment.createdBy,
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
