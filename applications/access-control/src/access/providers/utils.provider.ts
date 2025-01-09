import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { isUUID } from "class-validator";
import { lastValueFrom } from "rxjs";
import { LogsCerberusConstants } from "src/logs/logs.contants";
import { LogsCerberusService } from "src/logs/logs.service";
import { FindOneByMacDto } from "src/microcontrollers/dto/find-by-mac.dto";
import { PrismaService } from "src/prisma/prisma.service"
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UtilsProvider {
    private readonly errorLogger = new Logger();
    private readonly prismaService: PrismaService = new PrismaService();
    private readonly logCerberusService: LogsCerberusService = new LogsCerberusService();
    private readonly createAuditLogUrl = process.env.LOGS_SERVICE_URL
    @Inject(CACHE_MANAGER) private cacheService: Cache

    constructor(
        private readonly httpService: HttpService,
    ) { }

    async findOneByEnvironmentId(environmentId: string) {
        if (!isUUID(environmentId)) {
            this.logCerberusService.create(LogsCerberusConstants.findOneMicrocontrollerBadRequest({ environmentId }));
            throw new HttpException('Invalid environment id', HttpStatus.BAD_REQUEST)
        }

        try {
            return await this.prismaService.microcontroller.findFirstOrThrow({
                where: {
                    environment_id: environmentId,
                    microcontroller_type: {
                        name: 'ESP8266'
                    },
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

    async findOneMobile(id: string) {
        const mobile = await this.prismaService.mobile.findFirst({
            where: {
                id,
                active: true
            }
        });

        return mobile;
    }

    async findOneEsp32ByMac(findOneByMac: FindOneByMacDto) {
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

    async findOneRFIDByTag(tag: string) {
        let response = { userId: null }

        const rfid = await this.prismaService.tag_rfid.findFirst({
            where: {
                tag, active: true
            }
        })

        if (rfid) {
            response.userId = rfid.user_id
        }

        return response
    }

    async findAccessByUserFrequenter(userId: string, environmentId: string) {
        const environmentUser = await this.prismaService.environment_user.findFirst({
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

        if (environmentUser.permanent_access) {
            response.access = true;
            return response;
        }

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
                    break;
                }
            }
        }

        return response;
    }

    async findAccessByUserManager(userId: string, environmentId: string) {
        const envManager = await this.prismaService.environment_manager.findFirst({
            where: {
                environment_id: environmentId,
                user_id: userId,
                active: true,
            },
            include: {
                environment: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        if (!envManager) {
            return null;
        }

        return { access: true, environmentName: envManager.environment.name };
    }

    async findOneEnvironment(id: string) {
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
            return await this.prismaService.environment.findFirstOrThrow({
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

        const environment = await this.prismaService.environment.findFirst({
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

        const esp8266 = await this.findOneMicrocontroller(esp8266Id);

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

    async sendAccessLogWhenWebRemoteAccessSuccess(
        environmentName: string,
        environmentId: string,
        esp8266Id: number,
        userName: string,
        userId: string
    ) {
        await this.logCerberusService.create(LogsCerberusConstants.webRemoteAccessSuccess(
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


        await this.logCerberusService.create(LogsCerberusConstants.mobileRemoteAccessSuccess(
            environmentName,
            userName,
            {
                environmentId,
                esp8266Id,
                userId
            }
        ));
    }

    private async findOneMicrocontroller(id: number) {
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
}