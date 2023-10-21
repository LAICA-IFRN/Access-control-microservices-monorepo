import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEsp32Dto } from './dto/create-microcontroller.dto';
import { UpdateEsp32Dto } from './dto/update-microcontroller.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUUID } from 'class-validator';
import { catchError, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { microcontroller } from '@prisma/client';
import { FindOneByMacDto } from './dto/find-by-mac.dto';

@Injectable()
export class Esp32Service {
  private readonly environmentsServiceUrl = process.env.ENVIRONMENTS_SERVICE_URL
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly errorLogger = new Logger()
  
  constructor (
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  async create(createEsp32Dto: CreateEsp32Dto) {
    await lastValueFrom(
      this.httpService.get(this.environmentsServiceUrl + createEsp32Dto.environmentId).pipe(
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
      const esp32 = await this.prisma.microcontroller.create({ data: {
        ...createEsp32Dto,
        microcontroller_type_id: 1
      } }); 

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
    
    return await this.prisma.microcontroller.findMany({ skip, take });
  }

  async findOneByMac(findOneByMac: FindOneByMacDto) {
    try {
      const esp32 = await this.prisma.microcontroller.findFirstOrThrow({
        where: { 
          mac: findOneByMac.mac,
          active: true,
          microcontroller_type_id: 1
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
      return await this.prisma.microcontroller.findMany({
        where: { environmentId, microcontroller_type_id: 1 }
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

  async findOne(id: string) {
    try {
      return this.prisma.microcontroller.findFirstOrThrow({
        where: { id, microcontroller_type_id: 1 }
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

  async update(id: string, updateEsp32Dto: UpdateEsp32Dto) {
    try {
      const esp32 = await this.prisma.microcontroller.update({
        where: { id, microcontroller_type_id: 1 },
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

  async updateStatus(id: string, status: boolean) {
    try {
      const esp32 = await this.prisma.microcontroller.update({
        where: { id, microcontroller_type_id: 1 },
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

  async remove(id: string) {
    let esp32: microcontroller

    try {
      esp32 = await this.prisma.microcontroller.delete({
        where: { id, microcontroller_type_id: 1 }
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
}
