import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMicrocontrollerDto } from './dto/create-microcontroller.dto';
import { AuditLogService } from 'src/logs/audit-log.service';
import { AuditConstants } from 'src/logs/audit-contants';
import { FindOneByMacDto } from './dto/find-by-mac.dto';
import { isUUID } from 'class-validator';
import { UpdateMicrocontrollerDto } from './dto/update-microcontroller.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { lastValueFrom } from 'rxjs';
import { AccessLogService } from 'src/logs/access-log.service';
import { AccessConstants } from 'src/logs/access-constants';
import { randomUUID } from 'crypto';

@Injectable()
export class MicrocontrollersService {;
  private readonly environmentsServiceUrl = process.env.ENVIRONMENTS_SERVICE_URL;
  private readonly usersServiceUrl = process.env.USERS_SERVICE_URL;
  private readonly errorLogger = new Logger();
  
  constructor (
    private readonly prismaService: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly accessLogService: AccessLogService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async createMicrocontroller (createMicrocontrollerDto: CreateMicrocontrollerDto) {
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
        }
      });

      this.auditLogService.create(AuditConstants.createMicrocontrollerSuccess(microcontroller));

      return microcontroller.id;
    } catch (error) {
      if (error.code === 'P2002') {
        this.auditLogService.create(AuditConstants.createMicrocontrollerConflict(createMicrocontrollerDto));
        throw new HttpException('Conflito com registro existente', HttpStatus.CONFLICT);
      } else if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.createMicrocontrollerNotFound(createMicrocontrollerDto));
        throw new HttpException('Tipo de microcontrolador não encontrado', HttpStatus.NOT_FOUND);
      } else {
        this.auditLogService.create(AuditConstants.createMicrocontrollerError(createMicrocontrollerDto));
        this.errorLogger.error('Erro inesperado ao criar microcontrolador', error);
        throw new HttpException('Erro inesperado ao criar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async setMicrocontrollerInfo (id: number, healthCode: number, doorStatus?: boolean) {
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

    const key = id.toString();
    const info: any = { healthCode };

    if (microcontroller.microcontroller_type.name === 'ESP8266') {
      const findRemoteAccessUrl = `${this.environmentsServiceUrl}/env/remote-access?esp8266Id=${id}`;
      const remoteAccess = await lastValueFrom(
        this.httpService.get(findRemoteAccessUrl)
      )
      .then(response => response.data)
      .catch(error => {
        this.errorLogger.error('Erro ao buscar acesso remoto', error);
      })

      const qrcode = randomUUID();

      info.doorStatus = remoteAccess.doorStatus;
      info.qrcode = qrcode;
      await this.cacheService.set(key, info);

      const response = { remoteAccess: false, qrcode };

      if (remoteAccess?.value) {
        await this.sendAccessLogWhenFindOne(
          remoteAccess.userName,
          remoteAccess.userId,
          remoteAccess.environmentName,
          remoteAccess.environmentId,
          microcontroller.mac,
          microcontroller.id
        );

        response.remoteAccess = true;
      }
      
      return response;
    } else {
      await this.cacheService.set(key, info);
      return true;
    }
  }

  async coldStartMicrocontroller (id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id, active: true },
    })

    if (!microcontroller) {
      this.auditLogService.create(AuditConstants.findOneMicrotrollerNotFound({ id }));
      throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
    }

    const key = `cold-start-${id.toString()}`;
    const date = new Date();
    await this.cacheService.set(key, date);

    this.auditLogService.create(AuditConstants.coldStartMicrocontrollerSuccess({ id, date, mac: microcontroller.mac }));

    return date;
  }

  async getColdStartMicrocontroller (id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id, active: true },
    })

    if (!microcontroller) {
      this.auditLogService.create(AuditConstants.findOneMicrotrollerNotFound({ id }));
      throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
    }

    const key = `cold-start-${id.toString()}`;
    const date = await this.cacheService.get(key);

    return { microcontroller: id, coldStart: date };
  }

  async sendAccessLogWhenFindOne (
    userName: string, 
    userId: string, 
    environmentName: string, 
    environmentId: string,
    microcontrollerMac: string,
    microcontrollerId: number,
  ) {
    await this.accessLogService.create(
      AccessConstants.remoteAccessSuccess(
        userName,
        environmentName,
        microcontrollerMac,
        {
          userId,
          environmentId,
          microcontrollerId
        }
      )
    )
  }

  async getMicrocontrollerInfo (id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id }
    });

    if (microcontroller) {
      const key = id.toString();
      return await this.cacheService.get(key);
    }
  }

  async getMicrocontrollerEnvironment (id: number) {
    const microcontroller = await this.prismaService.microcontroller.findFirst({
      where: { id }
    });
    
    if (microcontroller) {
      const key = id.toString();
      const data: any = await this.cacheService.get(key);

      return {
        environmentId: microcontroller.environment_id,
        qrcode: data?.qrcode
      }
    }

    return null;
  }

  async activateMicrocontroller (id: number, environmentId: string) {
    if(isNaN(id)) {
      this.auditLogService.create(AuditConstants.findOneMicrocontrollerBadRequest({ id }));
      throw new HttpException('Invalid microcontroller id', HttpStatus.BAD_REQUEST)
    }

    if(!isUUID(environmentId)) {
      this.auditLogService.create(AuditConstants.findOneMicrocontrollerBadRequest({ environmentId }));
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
        }
      })

      this.auditLogService.create(AuditConstants.createMicrocontrollerSuccess(microcontroller));

      return microcontroller.id;
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.findOneMicrotrollerNotFound({ id }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.auditLogService.create(AuditConstants.createMicrocontrollerError({ id }));
        this.errorLogger.error('Erro inesperado ao criar microcontrolador', error);
        throw new HttpException('Erro inesperado ao criar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async findAll(skip: number, take: number) {
    if (isNaN(skip) || isNaN(take)) {
      this.auditLogService.create(AuditConstants.findManyMicrocontrollersBadRequest({ skip, take }));
      throw new HttpException('Invalid skip or take', HttpStatus.BAD_REQUEST)
    }

    const [microcontrollers, count] = await this.prismaService.$transaction([
      this.prismaService.microcontroller.findMany({
        where: {
          active: true
        },
        skip,
        take
      }),
      
      this.prismaService.microcontroller.count({
        where: {
          active: true
        }
      })
    ])

    const pages = Math.ceil(count / take)

    return {
      microcontrollers,
      count,
      pages
    }
  }

  async findAllInactives(skip: number, take: number) {
    if (isNaN(skip) || isNaN(take)) {
      this.auditLogService.create(AuditConstants.findManyMicrocontrollersBadRequest({ skip, take }));
      throw new HttpException('Invalid skip or take', HttpStatus.BAD_REQUEST)
    }

    const [microcontrollers, count] = await this.prismaService.$transaction([
      this.prismaService.microcontroller.findMany({
        where: {
          active: false
        },
        skip,
        take
      }),
      
      this.prismaService.microcontroller.count({
        where: {
          active: false
        }
      })
    ])

    const pages = Math.ceil(count / take)

    return {
      microcontrollers,
      count,
      pages
    }
  }

  async findOneByMac(findOneByMac: FindOneByMacDto) {
    try {
      const microcontroller = await this.prismaService.microcontroller.findFirstOrThrow({
        where: { 
          mac: findOneByMac.mac,
          active: true,
          //microcontroller_type_id: 1
        }
      })

      return {
        ip: microcontroller.ip,
        mac: microcontroller.mac,
        environmentId: microcontroller.environment_id
      }
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.findOneMicrotrollerNotFound(findOneByMac));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.auditLogService.create(AuditConstants.findOneMicrontorllerError(findOneByMac));
        this.errorLogger.error('Erro inesperado ao buscar microcontrolador', error);
        throw new HttpException('Erro inesperado ao buscar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async findAllByEnvironmentId(environmentId: string) {
    if(!isUUID(environmentId)) {
      this.auditLogService.create(AuditConstants.findManyMicrocontrollersBadRequest({ environmentId }));
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
        this.auditLogService.create(AuditConstants.findAllByEnvironmentIdNotFound({ environmentId }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.auditLogService.create(AuditConstants.findAllByEnvironmentIdError({ environmentId }));
        this.errorLogger.error('Erro inesperado ao buscar microcontrolador', error);
        throw new HttpException('Erro inesperado ao buscar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async findOne(id: number) {
    if(isNaN(id)) {
      this.auditLogService.create(AuditConstants.findOneMicrocontrollerBadRequest({ id }));
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST)
    }

    try {
      return await this.prismaService.microcontroller.findFirst({
        where: {
          id,
          active: true
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.findOneMicrotrollerNotFound({ id }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.auditLogService.create(AuditConstants.findOneMicrontorllerError({ id }));
        this.errorLogger.error('Erro inesperado ao buscar microcontrolador', error);
        throw new HttpException('Erro inesperado ao buscar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async update(id: number, updateMicrocontrollerDto: UpdateMicrocontrollerDto) {
    if(isNaN(id)) {
      this.auditLogService.create(AuditConstants.findOneMicrocontrollerBadRequest({ id }));
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

      this.auditLogService.create(AuditConstants.createMicrocontrollerSuccess(updateMicrocontrollerDto));

      return microcontroller;
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.findOneMicrotrollerNotFound({
          id, 
          type: updateMicrocontrollerDto.type
        }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.auditLogService.create(AuditConstants.updateMicrocontrollerError({ id }));
        this.errorLogger.error('Erro inesperado ao atualizar microcontrolador', error);
        throw new HttpException('Erro inesperado ao atualizar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateStatus(id: number, status: boolean) {
    if(isNaN(id)) {
      this.auditLogService.create(AuditConstants.findOneMicrocontrollerBadRequest({ id }));
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST)
    }

    if (typeof status !== 'boolean') {
      this.auditLogService.create(AuditConstants.updateMicrocontrollerBadRequest({ status }));
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST)
    }

    try {
      const microcontroller = await this.prismaService.microcontroller.update({
        where: {
          id,
        },
        data: {
          active: status
        }
      })

      this.auditLogService.create(AuditConstants.createMicrocontrollerSuccess(microcontroller));

      return microcontroller;
    } catch (error) {
      if (error.code === 'P2025') {
        this.auditLogService.create(AuditConstants.findOneMicrotrollerNotFound({ id }));
        throw new HttpException('Microcontrolador não encontrado', HttpStatus.NOT_FOUND)
      } else {
        this.auditLogService.create(AuditConstants.updateMicrocontrollerError({ id }));
        this.errorLogger.error('Erro inesperado ao atualizar microcontrolador', error);
        throw new HttpException('Erro inesperado ao atualizar microcontrolador', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
