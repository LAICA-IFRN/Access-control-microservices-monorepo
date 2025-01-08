import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateRfidDto } from './dto/create-rfid.dto';
import { UpdateStatusRfidDto } from './dto/update-status-rfid.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { FindAllDto } from 'src/utils/find-all.dto';


@Injectable()
export class RfidService {
  private readonly usersServiceUrl = `${process.env.USERS_SERVICE_URL}`
  private readonly createAuditLogUrl = process.env.AUDIT_LOG_URL
  private readonly errorLogger = new Logger()

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) { }

  async create(createRfidDto: CreateRfidDto) {
    const findUserEndpoint = `${this.usersServiceUrl}/${createRfidDto.userId}`
    const findUser = await lastValueFrom(
      this.httpService.get(findUserEndpoint)
        .pipe(
          catchError((error) => {
            if (error.code === 'ECONNREFUSED') {
              lastValueFrom(
                this.httpService.post(this.createAuditLogUrl, {
                  topic: 'Dispositivos',
                  type: 'Error',
                  message: 'Falha ao criar Tag RFID, serviço de usuários indisponível',
                  meta: {
                    device: 'RFID',
                    userId: createRfidDto.userId,
                  }
                })
              )
                .catch((error) => {
                  this.errorLogger.error('Falha ao enviar log', error)
                })
            }

            if (error.response?.status === 404) {
              lastValueFrom(
                this.httpService.post(this.createAuditLogUrl, {
                  topic: 'Dispositivos',
                  type: 'Error',
                  message: 'Falha ao criar Tag RFID, usuário não encontrado',
                  meta: {
                    device: 'RFID',
                    userId: createRfidDto.userId,
                  }
                })
              )
                .then((response) => response.data)
                .catch((error) => {
                  this.errorLogger.error('Falha ao enviar log', error)
                })

              throw new HttpException('User not found', HttpStatus.NOT_FOUND)
            } else if (error.response?.status === 400) {
              lastValueFrom(
                this.httpService.post(this.createAuditLogUrl, {
                  topic: 'Dispositivos',
                  type: 'Error',
                  message: 'Falha ao criar Tag RFID, ID de usuário inválido',
                  meta: {
                    device: 'RFID',
                    userId: createRfidDto.userId,
                  }
                })
              )
                .then((response) => response.data)
                .catch((error) => {
                  this.errorLogger.error('Falha ao enviar log', error)
                })

              throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST)
            } else {
              lastValueFrom(
                this.httpService.post(this.createAuditLogUrl, {
                  topic: 'Dispositivos',
                  type: 'Error',
                  message: 'Falha ao criar Tag RFID, erro interno verificar logs de erro do serviço',
                  meta: {
                    device: 'RFID',
                    userId: createRfidDto.userId,
                  }
                })
              )
                .then((response) => response.data)
                .catch((error) => {
                  this.errorLogger.error('Falha ao enviar log', error)
                })

              this.errorLogger.error('Falha ao buscar usuário na criação de tag rfid', error)

              throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
            }
          })
        )
    ).then((response) => response.data)

    try {
      const rfid = await this.prismaService.tag_rfid.create({
        data: {
          tag: createRfidDto.tag,
          user_id: findUser.id,
          created_by: createRfidDto.createdBy
        },
      })

      this.sendLogWhenCreate(rfid.tag, createRfidDto);

      return rfid
    } catch (error) {
      if (error.code === 'P2002') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha ao criar Tag RFID: conflito com registro existente',
            meta: {
              device: 'RFID',
              target: error.meta.target,
            }
          })
        )
          .then((response) => response.data)
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException(`Already exists: ${error.meta.target}`, HttpStatus.CONFLICT)
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha ao criar Tag RFID',
            meta: {
              device: 'RFID',
              error: error.message,
            }
          })
        )
          .then((response) => response.data)
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async sendLogWhenCreate(tag: string, createRfidDto: CreateRfidDto) {
    const user = await this.findUserForLog(createRfidDto.userId);
    const createdByUser = await this.findUserForLog(createRfidDto.createdBy);

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: 'Dispositivos',
        type: 'Info',
        message: `${createdByUser.name} criou a tag RFID ${tag} para o usuário ${user.name}`,
        meta: {
          device: 'RFID',
          tag: tag,
          userId: user.id
        }
      })
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error)
      })
  }

  async findAll(findAllDto: FindAllDto) {
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const order = findAllDto.orderBy ? findAllDto.orderBy : {};
    const filter = findAllDto.where ? findAllDto.where : {};

    try {
      const [rfids, total] = await this.prismaService.$transaction([
        this.prismaService.tag_rfid.findMany({
          skip: previousLenght,
          take: nextLenght,
          orderBy: order,
          where: filter,
        }),
        
        this.prismaService.tag_rfid.count({
          where: filter
        })
      ])

      return {
        pageSize: findAllDto.pageSize,
        previous: findAllDto.previous,
        next: findAllDto.next,
        total,
        data: rfids
      };
    } catch (error) {}
  }

  async findOne(id: number) {
    if (isNaN(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Dispositivos',
          type: 'Error',
          message: 'Falha buscar Tag RFID: ID inválido',
          meta: {
            device: 'RFID',
            id
          }
        })
      )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error)
        })

      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST)
    }

    try {
      return await this.prismaService.tag_rfid.findFirstOrThrow({
        where: {
          id, active: true
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha buscar Tag RFID: registro não encontrado',
            meta: {
              device: 'RFID',
              id
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException('Tag not found', HttpStatus.NOT_FOUND)
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha buscar Tag RFID: erro interno, verificar logs de erro do serviço',
            meta: {
              device: 'RFID',
              id
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async findOneByTag(tag: string) {
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

  async updateStatus(updateStatusRfidDto: UpdateStatusRfidDto) {
    try {
      const rfid = await this.prismaService.tag_rfid.update({
        where: {
          id: updateStatusRfidDto.tagId
        },
        data: {
          active: updateStatusRfidDto.status
        }
      })

      this.sendLogWhenUpdateStatus(rfid.tag, updateStatusRfidDto);

      return rfid
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha atualizar status da Tag RFID: registro não encontrado',
            meta: {
              device: 'RFID',
              tagId: updateStatusRfidDto.tagId
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException('Tag not found', HttpStatus.NOT_FOUND)
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha atualizar status da Tag RFID: erro interno, verificar logs de erro do serviço',
            meta: {
              device: 'RFID',
              tagId: updateStatusRfidDto.tagId
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async sendLogWhenUpdateStatus(tag: string, updateStatusRfidDto: UpdateStatusRfidDto) {
    const user = await this.findUserForLog(updateStatusRfidDto.updatedBy);

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: 'Dispositivos',
        type: 'Info',
        message: `${user.name} alterou o status da tag RFID ${tag} para ${updateStatusRfidDto.status ? 'ativo' : 'inativo'}`,
        meta: {
          device: 'RFID',
          tag: tag,
          userId: user.id
        }
      })
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error)
      })
  }

  async remove(id: number, deletedBy?: string) {
    if (isNaN(id)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Dispositivos',
          type: 'Error',
          message: 'Falha remover Tag RFID: ID inválido',
          meta: {
            device: 'RFID',
            id
          }
        })
      )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error)
        })

      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST)
    }

    try {
      const rfid = await this.prismaService.tag_rfid.delete({
        where: {
          id
        }
      })

      this.sendLogWhenRemove(rfid.tag, deletedBy);

      return rfid
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha remover Tag RFID: registro não encontrado',
            meta: {
              device: 'RFID',
              id
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException('Tag not found', HttpStatus.NOT_FOUND)
      } else {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha remover Tag RFID: erro interno, verificar logs de erro do serviço',
            meta: {
              device: 'RFID',
              id
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })

        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async sendLogWhenRemove(tag: string, deletedBy: string) {
    const user = await this.findUserForLog(deletedBy);

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: 'Dispositivos',
        type: 'Info',
        message: `${user.name} removeu a tag RFID ${tag}`,
        meta: {
          device: 'RFID',
          tag: tag,
          userId: user.id,
          deletedBy
        }
      })
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error)
      })
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
