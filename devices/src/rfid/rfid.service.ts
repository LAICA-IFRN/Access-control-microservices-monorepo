import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateRfidDto } from './dto/create-rfid.dto';
import { UpdateStatusRfidDto } from './dto/update-status-rfid.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';


@Injectable()
export class RfidService {
  private readonly usersServiceUrl = `${process.env.USERS_SERVICE_URL}`
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
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
            console.log(error);

            if (error.code === 'ECONNREFUSED') {
              lastValueFrom(
                this.httpService.post(this.createAuditLogUrl, {
                  topic: 'Dispositivos',
                  type: 'Error',
                  message: 'Falha ao criar Tag RFID: serviço de usuários indisponível',
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
                  message: 'Falha ao criar Tag RFID: usuário não encontrado',
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
                  message: 'Falha ao criar Tag RFID: ID de usuário inválido',
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
                  message: 'Falha ao criar Tag RFID: erro interno, verificar logs de erro do serviço',
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

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Dispositivos',
          type: 'Info',
          message: `Tag RFID criada com sucesso`,
          meta: {
            device: 'RFID',
            tag: rfid.id,
            userId: rfid.user_id
          }
        })
      )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error)
        })

      return rfid
    } catch (error) {
      console.log('try\n', error);

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

  async findAll(skip: number, take: number) {
    if (isNaN(skip) || isNaN(take)) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Dispositivos',
          type: 'Error',
          message: 'Falha buscar Tags RFID: skip ou take inválidos',
          meta: {
            device: 'RFID',
            skip,
            take
          }
        })
      )
        .then((response) => response.data)
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error)
        })

      throw new HttpException('Invalid skip or take', HttpStatus.BAD_REQUEST)
    }

    const [tags, count] = await this.prismaService.$transaction([
      this.prismaService.tag_rfid.findMany({
        where: {
          active: true
        },
        skip,
        take
      }),

      this.prismaService.tag_rfid.count({
        where: {
          active: true
        }
      })
    ])

    const pages = Math.ceil(count / take)

    return {
      tags,
      count,
      pages
    }
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

  async findOneByTag(tag: string) { // para uso do serviço de acesso
    let response = { userId: null }

    try {
      const rfid = await this.prismaService.tag_rfid.findFirstOrThrow({
        where: {
          tag, active: true
        }
      })

      if (rfid) {
        response.userId = rfid.user_id
      }
    } catch (error) {
      if (error.code === 'P2025') {
        await lastValueFrom(
          this.httpService.post(this.createAuditLogUrl, {
            topic: 'Dispositivos',
            type: 'Error',
            message: 'Falha buscar Tag RFID durane acesso: registro não encontrado',
            meta: {
              device: 'RFID',
              tag
            }
          })
        )
          .catch((error) => {
            this.errorLogger.error('Falha ao enviar log', error)
          })
      }
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

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Dispositivos',
          type: 'Info',
          message: `Status da tag RFID atualizada com sucesso`,
          meta: {
            device: 'RFID',
            tag: rfid.id,
            userId: rfid.user_id
          }
        })
      )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error)
        })

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

  async remove(id: number, deletedBy: string) {
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

      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Dispositivos',
          type: 'Info',
          message: `Tag RFID removida com sucesso`,
          meta: {
            device: 'RFID',
            tag: rfid.id,
            userId: rfid.user_id,
            deletedBy
          }
        })
      )
        .catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error)
        })

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
}
