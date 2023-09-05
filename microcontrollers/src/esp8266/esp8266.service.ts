import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEsp8266Dto } from './dto/create-esp8266.dto';
import { UpdateEsp8266Dto } from './dto/update-esp8266.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { isUUID } from 'class-validator';

@Injectable()
export class Esp8266Service {
  private readonly createAuditLogUrl = 'http://localhost:6004/audit/logs'
  private readonly errorLogger = new Logger()

  constructor (
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  async create(createEsp8266Dto: CreateEsp8266Dto) {
    try {
      const esp8266 = await this.prisma.esp8266.create({
        data: {
          environmentId: createEsp8266Dto.environmentId,
          mac: createEsp8266Dto.mac,
          ip: createEsp8266Dto.ip,
          esp32Id: createEsp8266Dto.esp32Id
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: `ESP8266 ${esp8266.mac} foi criado`,
          meta: {
            microntroller: 'Esp8266',
            target: esp8266.id,
            statusCode: 201
          }
        })
      )
      .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

      return esp8266
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao criar esp8266: conflito com registro existente',
            meta: {
              microcontroller: 'Esp8266',
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
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao criar esp8266: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp8266',
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
          "Can't create esp8266 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async findAll(skip?: number, take?: number) {
    try {
      // console.log('skip', skip);
      // console.log('take', take);
      
      return await this.prisma.esp8266.findMany({
        skip,
        take
      })
    } catch (error) {
      console.log(error)
    }
  }

  async findAllByEnvironmentId(environmentId: string) {
    if (!isUUID(environmentId)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Error',
          message: 'Falha ao buscar os esp8266 de um ambiente: id inválido',
          meta: {
            microcontroller: 'Esp8266',
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
        'Invalid environment id',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      return await this.prisma.esp8266.findMany({
        where: {
          environmentId
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao buscar os esp8266 de um ambiente: ambiente não encontrado',
            meta: {
              microcontroller: 'Esp8266',
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
          'Environment not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao buscar os esp8266 de um ambiente: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp8266',
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
          "Can't find environment",
          HttpStatus.FORBIDDEN
        );
      }
    } 
  }

  async findOne(id: number) {
    try {
      return await this.prisma.esp8266.findUnique({
        where: {
          id
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao buscar um esp8266: esp8266 não encontrado',
            meta: {
              microcontroller: 'Esp8266',
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
          'Esp8266 not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao buscar um esp8266: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp8266',
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

        console.log(error)
        throw new HttpException(
          "Can't find esp8266",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async update(id: number, updateEsp8266Dto: UpdateEsp8266Dto) {
    try {
      const esp8266 = await this.prisma.esp8266.update({
        where: {
          id
        },
        data: {
          environmentId: updateEsp8266Dto.environmentId,
          mac: updateEsp8266Dto.mac,
          ip: updateEsp8266Dto.ip,
          esp32Id: updateEsp8266Dto.esp32Id
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: `ESP8266 ${esp8266.mac} foi atualizado`,
          meta: {
            microntroller: 'Esp8266',
            target: esp8266.id,
            statusCode: 200
          }
        })
      )
      .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

      return esp8266
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar esp8266: esp8266 não encontrado',
            meta: {
              microcontroller: 'Esp8266',
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
          'Esp8266 not found',
          HttpStatus.NOT_FOUND
        );
      } else if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar esp8266: conflito com registro existente',
            meta: {
              microcontroller: 'Esp8266',
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
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar esp8266: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp8266',
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
          "Can't update esp8266 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async updateStatus(id: number, status: boolean) {
    try {
      const esp8266 = await this.prisma.esp8266.update({
        where: {
          id
        },
        data: {
          active: status
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: `ESP8266 ${esp8266.mac} foi atualizado`,
          meta: {
            microntroller: 'Esp8266',
            target: esp8266.id,
            statusCode: 200
          }
        })
      )
      .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

      return esp8266
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar esp8266: esp8266 não encontrado',
            meta: {
              microcontroller: 'Esp8266',
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
          'Esp8266 not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao atualizar esp8266: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp8266',
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
          "Can't update esp8266 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  async remove(id: number) {
    try {
      const esp8266 = await this.prisma.esp8266.delete({
        where: {
          id
        }
      })

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Microcontroladores',
          type: 'Info',
          message: `ESP8266 ${esp8266.mac} foi removido`,
          meta: {
            microntroller: 'Esp8266',
            target: esp8266.id,
            statusCode: 200
          }
        })
      )
      .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao criar log', error);
        });

      return esp8266
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao remover esp8266: esp8266 não encontrado',
            meta: {
              microcontroller: 'Esp8266',
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
          'Esp8266 not found',
          HttpStatus.NOT_FOUND
        );
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Microcontroladores',
            type: 'Error',
            message: 'Falha ao remover esp8266: erro interno, verificar logs de erro do serviço',
            meta: {
              microcontroller: 'Esp8266',
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
          "Can't remove esp8266 record",
          HttpStatus.FORBIDDEN
        );
      }
    }
  }
}
