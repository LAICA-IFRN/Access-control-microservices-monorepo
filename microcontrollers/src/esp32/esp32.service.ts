import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEsp32Dto } from './dto/create-esp32.dto';
import { UpdateEsp32Dto } from './dto/update-esp32.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUUID } from 'class-validator';
import { catchError, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Esp32 } from '@prisma/client';
import { FindOneByMacDto } from './dto/find-by-mac.dto';

@Injectable()
export class Esp32Service {
  private readonly createAuditLogUrl = 'http://localhost:6004/service/audit/logs'
  private readonly errorLogger = new Logger()

  constructor (
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  async create(createEsp32Dto: CreateEsp32Dto) {
    const getEnvironmentUrl = `http://localhost:6002/service/environments/env/${createEsp32Dto.environmentId}`
    await lastValueFrom(
      this.httpService.get(getEnvironmentUrl).pipe(
        catchError((error) => {
          console.log(error);
          
          if (error.response.status === 404) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Microcontroladores',
                type: 'Error',
                message: 'Falha ao criar esp32: ambiente não encontrado',
                meta: {
                  microcontroller: 'Esp32',
                  environment: createEsp32Dto.environmentId,
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
                topic: 'Microcontroladores',
                type: 'Error',
                message: 'Falha ao criar esp32: erro interno, verificar logs de erro do serviço',
                meta: {
                  microcontroller: 'Esp32',
                  environment: createEsp32Dto.environmentId,
                  statusCode: 500
                }
              })
            )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao criar log', error);
            })

            this.errorLogger.error('Falha do sistema (500)', error)
            throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
          }
        })
      )
    )

    try {
      const esp32 = await this.prisma.esp32.create({ data: createEsp32Dto }); 

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: 'Esp32 criado com sucesso',
          meta: {
            microcontroller: 'Esp32',
            target: [esp32.id, esp32.environmentId],
            statusCode: 201
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return esp32;
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao criar esp32: conflito com registro existente',
            meta: {
              microcontroller: 'Esp32',
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
      } else if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao criar esp32: registro não encontrado',
            meta: {
              microcontroller: 'Esp32',
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
          `Record not found: ${error.meta.target}`,
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao criar esp32: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
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

        console.log(error);
        
        throw new HttpException(
          "Can't create esp32 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async findAll(skip?: number, take?: number) {
    if (isNaN(skip) || isNaN(take)) {
      throw new HttpException('Invalid skip or take', HttpStatus.BAD_REQUEST)
    }
    
    return await this.prisma.esp32.findMany({ skip, take });
  }

  async findOneByMac(findOneByMac: FindOneByMacDto) {
    try {
      const esp32 = await this.prisma.esp32.findFirstOrThrow({
        where: { 
          mac: findOneByMac.mac,
          active: true
        }
      })

      return {
        ip: esp32.ip,
        mac: esp32.mac,
        environmentId: esp32.environmentId
      }
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Microcontroladores",
            type: "Error",
            message: 'Falha ao buscar esp32: registro não encontrado',
            meta: {
              mac: findOneByMac.mac
            }
          })
        )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        });

        throw new HttpException(
          `Esp32 not found`,
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Microcontroladores",
            type: "Error",
            message: 'Falha ao buscar os esp32: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
              mac: findOneByMac.mac,
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
          "Can't find esp32 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async findAllByEnvironmentId(environmentId: string) {
    if (!isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: "Microcontroladores",
          type: "Error",
          message: 'Falha ao buscar os esp32 de um ambiente: id inválido',
          meta: {
            microcontroller: 'Esp32',
            target: environmentId,
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
      return await this.prisma.esp32.findMany({
        where: { environmentId }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Microcontroladores",
            type: "Error",
            message: 'Falha ao buscar os esp32 de um ambiente: ambiente não encontrado',
            meta: {
              microcontroller: 'Esp32',
              target: environmentId,
              statusCode: 404
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

        throw new HttpException(
          `Environment not found`,
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Microcontroladores",
            type: "Error",
            message: 'Falha ao buscar os esp32 de um ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
              target: environmentId,
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
          "Can't find esp32 records",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async findOne(id: number) {
    try {
      return this.prisma.esp32.findFirstOrThrow({
        where: { id }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Microcontroladores",
            type: "Error",
            message: 'Falha ao buscar esp32: registro não encontrado',
            meta: {
              microcontroller: 'Esp32',
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
          "Esp32 not found",
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: "Microcontroladores",
            type: "Error",
            message: 'Falha ao buscar esp32: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
              target: id,
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
          "Can't find esp32 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async update(id: number, updateEsp32Dto: UpdateEsp32Dto) {
    try {
      const esp32 = await this.prisma.esp32.update({
        where: { id },
        data: updateEsp32Dto
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: 'Esp32 atualizado com sucesso',
          meta: {
            microcontroller: 'Esp32',
            target: [esp32.id, esp32.environmentId],
            statusCode: 200
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return esp32;
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar esp32: registro não encontrado',
            meta: {
              microcontroller: 'Esp32',
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
          "Esp32 not found",
          HttpStatus.NOT_FOUND
        );
      } else if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: `Falha ao atualizar esp32: conflito com registro existente`,
            meta: {
              microcontroller: 'Esp32',
              target: error.meta.target,
              statusCode: 409
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error)
        });

        throw new HttpException(
          `Already exists: ${error.meta.target}`,
          HttpStatus.CONFLICT
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar esp32: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
              target: id,
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
          "Can't update esp32 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async updateStatus(id: number, status: boolean) {
    try {
      const esp32 = await this.prisma.esp32.update({
        where: { id },
        data: {
          active: status
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: 'Status de Esp32 atualizado com sucesso',
          meta: {
            microcontroller: 'Esp32',
            target: [esp32.id, esp32.environmentId, esp32.active],
            statusCode: 200
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return esp32;
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar status de esp32: registro não encontrado',
            meta: {
              microcontroller: 'Esp32',
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
          "Esp32 not found",
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar status de esp32: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
              target: id,
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
          "Can't change esp32 status",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async remove(id: number) {
    let esp32: Esp32

    try {
      esp32 = await this.prisma.esp32.delete({
        where: { id }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: 'Esp32 removido com sucesso',
          meta: {
            microcontroller: 'Esp32',
            target: [esp32.id, esp32.environmentId],
            statusCode: 200
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });
    } catch (error) {
      console.log(error);
      
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao remover esp32: registro não encontrado',
            meta: {
              microcontroller: 'Esp32',
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
          "Esp32 not found",
          HttpStatus.NOT_FOUND
          );
      } else if (error.code === 'P2003') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao remover esp32: registro está sendo usado por outro registro',
            meta: {
              microcontroller: 'Esp32',
              target: id,
              statusCode: 403
            }
          })
        )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });
        
        throw new HttpException(
          "Esp32 is being used",
          HttpStatus.FORBIDDEN
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao remover esp32: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
              target: id,
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
          "Can't delete esp32 record",
          HttpStatus.FORBIDDEN
        );
      }
    }

    return esp32;
  }

  async disconnectEsp8266(id: number) {
    const esp8266 = await this.prisma.esp8266.findFirst({
      where: { esp32Id: id }
    })

    if (!esp8266) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Error',
          message: 'Falha ao desconectar esp8266: esp8266 não encontrado',
          meta: {
            microcontroller: 'Esp32',
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
        "Esp8266 not found",
        HttpStatus.NOT_FOUND
      );
    }

    try {
      const esp32 = await this.prisma.esp32.update({
        where: { id },
        data: {
          Esp8266: {
            disconnect: true
          },
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: 'Esp8266 desconectado com sucesso',
          meta: {
            microcontroller: 'Esp32',
            esp8266Mac: esp8266.mac,
            esp32Id: esp32.id,
            statusCode: 200
          }
        })
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar log', error);
      });

      return esp32;
    } catch (error) {
      console.log(error);
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao desconectar esp8266: registro não encontrado',
            meta: {
              microcontroller: 'Esp32',
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
          "Esp32 not found",
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao desconectar esp8266: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp32',
              target: id,
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
          "Can't disconnect esp8266",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }
}
