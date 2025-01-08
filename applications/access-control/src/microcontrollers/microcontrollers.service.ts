import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMicrocontrollerDto } from './dto/create-microcontroller.dto';
import { LogsCerberusService } from 'src/logs/logs.service';
import { LogsCerberusConstants } from 'src/logs/logs.contants';
import { FindOneByMacDto } from './dto/find-by-mac.dto';
import { isUUID } from 'class-validator';
import { UpdateMicrocontrollerDto } from './dto/update-microcontroller.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { lastValueFrom } from 'rxjs';
import { FindAllDto } from 'src/utils/find-all.dto';
import { access } from 'fs';

@Injectable()
export class MicrocontrollersService {
  ;
  private readonly environmentsServiceUrl = process.env.ENVIRONMENTS_SERVICE_URL;
  private readonly usersServiceUrl = process.env.USERS_SERVICE_URL;
  private readonly errorLogger = new Logger();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly logCerberusService: LogsCerberusService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) { }

  async createMicrocontroller(createMicrocontrollerDto: CreateMicrocontrollerDto) {
    try {
      const microcontroller = await this.prismaService.microcontroller.create({
        data: {
          ip: createMicrocontrollerDto.ip,
          mac: createMicrocontrollerDto.mac,
          microcontroller_type: {
            connect: {
              name: createMicrocontrollerDto.type
            }
          }
        },
        select: {
          id: true,
          mac: true,
          microcontroller_type: {
            select: {
              name: true
            }
          }
        }
      });

      this.logCerberusService.create(LogsCerberusConstants.createMicrocontrollerSuccess(microcontroller));

      return microcontroller.id;
    } catch (error) {
      if (error.code === 'P2002') {
        this.logCerberusService.create(LogsCerberusConstants.createMicrocontrollerConflict(createMicrocontrollerDto));
        throw new HttpException('Conflito com registro existente', HttpStatus.CONFLICT);
      } else if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.createMicrocontrollerNotFound(createMicrocontrollerDto));
        throw new HttpException('Tipo de microcontrolador não encontrado', HttpStatus.NOT_FOUND);
      } else {
        this.logCerberusService.create(LogsCerberusConstants.createMicrocontrollerError(createMicrocontrollerDto));
        this.errorLogger.error('Erro inesperado ao criar microcontrolador', error);
        throw new HttpException('Erro inesperado ao criar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async setMicrocontrollerInfo(id: number, healthCode: number, doorStatus?: boolean) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id },
      include: {
        microcontroller_type: {
          select: {
            name: true
          }
        }
      }
    });

    if (!microcontroller) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({ id }));
      throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
    }

    const key = id.toString();
    const info: any = { healthCode, doorStatus };
    await this.cacheService.set(key, info);

    const remoteAccess = await this.searchRemoteAccess(id);

    return { access: remoteAccess }
  }

  async coldStartMicrocontroller(id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id, active: true },
    })

    if (!microcontroller) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({ id }));
      throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
    }

    try {
      const coldStart = await this.prismaService.microcontroller_cold_start.create({
        data: {
          microcontroller_id: id
        }
      });

      this.logCerberusService.create(LogsCerberusConstants.coldStartMicrocontrollerSuccess({ id, coldStart, mac: microcontroller.mac }));
      return coldStart;
    } catch (error) {
      this.errorLogger.error('Erro inesperado ao criar cold start', error);
      throw new HttpException('Erro inesperado ao criar cold start', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getColdStartMicrocontroller(id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id, active: true },
    })

    if (!microcontroller) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({ id }));
      throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
    }

    const key = `cold-start-${id.toString()}`;
    const date = await this.cacheService.get(key);

    return { microcontroller: id, coldStart: date };
  }

  async getMicrocontrollerInfo(id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id }
    });

    if (microcontroller) {
      const key = id.toString();
      return await this.cacheService.get(key);
    }
  }

  async searchRemoteAccess(id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id, active: true },
      select: {
        mac: true,
        microcontroller_type: {
          select: {
            name: true
          }
        }
      }
    });

    if (!microcontroller) {
      throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND);
    }

    const searchRemoteAccessUrl = `${this.environmentsServiceUrl}/env/remote-access?esp8266Id=${id}`;
    const remoteAccess = await lastValueFrom(
      this.httpService.get(searchRemoteAccessUrl)
    )
      .then(response => response.data)
      .catch(error => {
        this.errorLogger.error('Erro ao buscar acesso remoto', error);
        throw new HttpException('Erro ao buscar acesso remoto', HttpStatus.INTERNAL_SERVER_ERROR);
      })

    if (remoteAccess.value) {
      this.sendAccessLogWhenFindOne(
        remoteAccess,
        microcontroller.mac,
        id,
        microcontroller.microcontroller_type.name
      );
    }

    return remoteAccess.value;
  }

  async getMicrocontrollerIdOrRegister() { }

  async sendAccessLogWhenFindOne(
    remoteAccess: any,
    microcontrollerMac: string,
    microcontrollerId: number,
    microcontrollerType: string,
  ) {
    if (remoteAccess.remoteAccessType === 'web') {
      await this.logCerberusService.create(
        LogsCerberusConstants.webRemoteAccessSuccess(
          remoteAccess.userName,
          remoteAccess.environmentName,
          {
            microcontrollerMac,
            microcontrollerType,
            userId: remoteAccess.userId,
            environmentId: remoteAccess.environmentId,
            microcontrollerId
          }
        )
      )
    } else {
      await this.logCerberusService.create(
        LogsCerberusConstants.mobileRemoteAccessSuccess(
          remoteAccess.userName,
          remoteAccess.environmentName,
          {
            microcontrollerMac,
            microcontrollerType,
            userId: remoteAccess.userId,
            environmentId: remoteAccess.environmentId,
            microcontrollerId
          }
        )
      )
    }
  }

  async activateMicrocontroller(id: number, environmentId: string, userId?: string) {
    if (isNaN(id)) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrocontrollerBadRequest({ id }));
      throw new HttpException('Invalid microcontroller id', HttpStatus.BAD_REQUEST)
    }

    if (!isUUID(environmentId)) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrocontrollerBadRequest({ environmentId }));
      throw new HttpException('Invalid environment id', HttpStatus.BAD_REQUEST)
    }

    try {
      const microcontroller = await this.prismaService.microcontroller.update({
        where: {
          id,
          active: false
        },
        data: {
          environment_id: environmentId,
          active: true
        },
        select: {
          id: true,
          mac: true,
          ip: true,
          microcontroller_type: {
            select: {
              name: true
            }
          }
        }
      })

      this.sendLogWhenActivateMicrocontroller(
        microcontroller.mac,
        microcontroller.ip,
        microcontroller.microcontroller_type.name,
        environmentId,
        userId
      );

      return microcontroller.id;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({ id }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.logCerberusService.create(LogsCerberusConstants.createMicrocontrollerError({ id }));
        this.errorLogger.error('Erro inesperado ao criar microcontrolador', error);
        throw new HttpException('Erro inesperado ao criar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async sendLogWhenActivateMicrocontroller(mac: string, ip: string, type: string, environmentId: string, userId: string) {
    const user = await this.findUserForLog(userId);
    const environment = await this.findEnvironmentForLog(environmentId);

    await this.logCerberusService.create(
      LogsCerberusConstants.activateMicrocontrollerSuccess(
        user.name,
        environment.name,
        mac,
        type,
        {
          mac,
          ip,
          userId,
          environmentId
        }
      )
    )
  }

  async findAll(findAllDto: FindAllDto) {
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const order = findAllDto.orderBy ? findAllDto.orderBy : {};
    const filter = findAllDto.where ? findAllDto.where : {};

    try {
      const [microcontrollers, total] = await this.prismaService.$transaction([
        this.prismaService.microcontroller.findMany({
          skip: previousLenght,
          take: nextLenght,
          orderBy: order,
          where: filter,
          select: {
            microcontroller_type: {
              select: {
                name: true
              }
            },
            id: true,
            ip: true,
            mac: true,
            active: true,
            created_at: true,
            updated_at: true,
          }
        }),

        this.prismaService.microcontroller.count({
          where: filter
        })
      ])

      return {
        pageSize: findAllDto.pageSize,
        previous: findAllDto.previous,
        next: findAllDto.next,
        total,
        data: microcontrollers
      };
    } catch (error) {
      this.logCerberusService.create(LogsCerberusConstants.findAllMicrontorllerError(findAllDto));
      this.errorLogger.error('Erro inesperado ao buscar microcontroladores', error);
      throw new HttpException('Erro inesperado ao buscar microcontroladores', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllInactives(findAllDto: FindAllDto) {
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const order = findAllDto.orderBy ? findAllDto.orderBy : {};

    try {
      const [microcontrollers, total] = await this.prismaService.$transaction([
        this.prismaService.microcontroller.findMany({
          skip: previousLenght,
          take: nextLenght,
          orderBy: order,
          where: {
            active: false,
          },
          select: {
            microcontroller_type: {
              select: {
                name: true
              }
            },
            id: true,
            ip: true,
            mac: true,
            active: true,
            created_at: true,
            updated_at: true,
          }
        }),

        this.prismaService.microcontroller.count({
          where: {
            active: false,
          }
        })
      ])

      return {
        pageSize: findAllDto.pageSize,
        previous: findAllDto.previous,
        next: findAllDto.next,
        total,
        data: microcontrollers
      };
    } catch (error) {
      this.logCerberusService.create(LogsCerberusConstants.findAllMicrontorllerError(findAllDto));
      this.errorLogger.error('Erro inesperado ao buscar microcontroladores', error);
      throw new HttpException('Erro inesperado ao buscar microcontroladores', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByMac(findOneByMac: FindOneByMacDto) {
    try {
      const microcontroller = await this.prismaService.microcontroller.findFirstOrThrow({
        where: {
          mac: findOneByMac.mac,
          active: true,
        }
      })

      return {
        ip: microcontroller.ip,
        mac: microcontroller.mac,
        environmentId: microcontroller.environment_id
      }
    } catch (error) {
      if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound(findOneByMac));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrontorllerError(findOneByMac));
        this.errorLogger.error('Erro inesperado ao buscar microcontrolador', error);
        throw new HttpException('Erro inesperado ao buscar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async findOneByEnvironmentId(environmentId: string) {
    if (!isUUID(environmentId)) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrocontrollerBadRequest({ environmentId }));
      throw new HttpException('Invalid environment id', HttpStatus.BAD_REQUEST)
    }

    try {
      return await this.prismaService.microcontroller.findFirstOrThrow({
        where: {
          environment_id: environmentId,
          microcontroller_type_id: 2,
          active: true
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({ environmentId }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrontorllerError({ environmentId }));
        this.errorLogger.error('Erro inesperado ao buscar microcontrolador', error);
        throw new HttpException('Erro inesperado ao buscar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async findAllByEnvironmentId(environmentId: string) {
    if (!isUUID(environmentId)) {
      this.logCerberusService.create(LogsCerberusConstants.findManyMicrocontrollersBadRequest({ environmentId }));
      throw new HttpException('Invalid environment id', HttpStatus.BAD_REQUEST)
    }

    try {
      return await this.prismaService.microcontroller.findMany({
        where: {
          environment_id: environmentId,
          microcontroller_type_id: 1,
          active: true
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.findAllByEnvironmentIdNotFound({ environmentId }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.logCerberusService.create(LogsCerberusConstants.findAllByEnvironmentIdError({ environmentId }));
        this.errorLogger.error('Erro inesperado ao buscar microcontrolador', error);
        throw new HttpException('Erro inesperado ao buscar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async findOne(id: number) {
    if (isNaN(id)) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrocontrollerBadRequest({ id }));
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST)
    }

    try {
      return await this.prismaService.microcontroller.findFirstOrThrow({
        where: {
          id,
          active: true
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({ id }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrontorllerError({ id }));
        this.errorLogger.error('Erro inesperado ao buscar microcontrolador', error);
        throw new HttpException('Erro inesperado ao buscar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async update(id: number, updateMicrocontrollerDto: UpdateMicrocontrollerDto) {
    if (isNaN(id)) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrocontrollerBadRequest({ id }));
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST)
    }

    try {
      const microcontroller = await this.prismaService.microcontroller.update({
        where: {
          id,
          active: true
        },
        data: updateMicrocontrollerDto,
        select: {
          microcontroller_type: {
            select: {
              name: true
            }
          }
        }
      })

      this.logCerberusService.create(LogsCerberusConstants.createMicrocontrollerSuccess(updateMicrocontrollerDto));

      return microcontroller;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({
          id,
          type: updateMicrocontrollerDto.type
        }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.logCerberusService.create(LogsCerberusConstants.updateMicrocontrollerError({ id }));
        this.errorLogger.error('Erro inesperado ao atualizar microcontrolador', error);
        throw new HttpException('Erro inesperado ao atualizar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateStatus(id: number, status: boolean, userId?: string) {
    if (isNaN(id)) {
      this.logCerberusService.create(LogsCerberusConstants.findOneMicrocontrollerBadRequest({ id }));
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST)
    }

    if (typeof status !== 'boolean') {
      this.logCerberusService.create(LogsCerberusConstants.updateMicrocontrollerBadRequest({ status }));
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST)
    }

    try {
      const microcontroller = await this.prismaService.microcontroller.update({
        where: {
          id,
        },
        data: {
          active: status
        },
        select: {
          environment_id: true,
          mac: true,
          microcontroller_type: {
            select: {
              name: true
            }
          }
        }
      })

      this.sendLogWhenUpdateMicrocontrollerStatus(
        userId,
        microcontroller.environment_id,
        microcontroller.mac,
        microcontroller.microcontroller_type.name,
        { status, mac: microcontroller.mac, userId, environmentId: microcontroller.environment_id }
      );

      return microcontroller;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logCerberusService.create(LogsCerberusConstants.findOneMicrotrollerNotFound({ id }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.logCerberusService.create(LogsCerberusConstants.updateMicrocontrollerError({ id }));
        this.errorLogger.error('Erro inesperado ao atualizar microcontrolador', error);
        throw new HttpException('Erro inesperado ao atualizar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async sendLogWhenUpdateMicrocontrollerStatus(
    userId: string,
    environmentId: string,
    microcontrollerMac: string,
    type: string,
    metaData: any
  ) {
    const user = await this.findUserForLog(userId);
    const environment = await this.findEnvironmentForLog(environmentId);

    await this.logCerberusService.create(
      LogsCerberusConstants.updateMicrocontrollerStatusSuccess(
        user.name,
        environment.name,
        microcontrollerMac,
        type,
        metaData
      )
    )
  }

  private async findUserForLog(userId: string) {
    const user = await lastValueFrom(
      this.httpService.get(`${process.env.USERS_SERVICE_URL}/${userId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao se conectar com o serviço de usuários (500)', error);
        throw new HttpException('Internal server error when search user', HttpStatus.INTERNAL_SERVER_ERROR);
      });

    return user;
  }

  private async findEnvironmentForLog(environmentId: string) {
    const environment = await lastValueFrom(
      this.httpService.get(`${process.env.ENVIRONMENTS_SERVICE_URL}/env/${environmentId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao se conectar com o serviço de ambientes (500)', error);
        throw new HttpException('Internal server error when search environments', HttpStatus.INTERNAL_SERVER_ERROR);
      });

    return environment;
  }
}
