import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccessDto } from './dto/access.dto';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly createAuditLogUrl = 'http://localhost:6004/audit/logs'
  private readonly getEsp32Url = 'http://localhost:6003/microcontrollers/esp32/mac'
  private readonly errorLogger = new Logger()

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async access(accessDto: AccessDto) {
    const esp32: any = await lastValueFrom(
      this.httpService.get(this.getEsp32Url, {
        data: {
          mac: accessDto.mac,
        }
      }).pipe(
        catchError((error) => {
          if (error.response.status === 404) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Acesso',
                type: 'Error',
                message: 'Falha ao tentar acesso: Esp32 não encontrado',
                meta: {
                  mac: accessDto.mac
                }
              })
            )
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error);
            });

            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else if (error.response.status === 400) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Acesso',
                type: 'Error',
                message: 'Falha ao tentar acesso: Mac inválido',
                meta: {
                  mac: accessDto.mac
                }
              })
            )
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error);
            });

            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Acesso',
                type: 'Error',
                message: 'Falha ao tentar acesso: Erro interno, verificar logs de erro do serviço',
                meta: {
                  mac: accessDto.mac
                }
              })
            )
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error);
            });

            this.errorLogger.error('Falha do sistema', error);

            throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
          }
        })
      )
    )
    
    const { environmentId } = esp32.data
    const { user, password, rfid, mobile } = accessDto

    if (rfid) {
      return this.proccessAccessWhenRFID(environmentId, rfid)
    } else if (mobile) {
      return this.proccessAccessWhenMobile(environmentId, mobile)
    } else {
      return await this.proccessAccessWhenUserAndPassword(environmentId, user, password)
    }
  }

  async proccessAccessWhenRFID(environmentId: string, rfid: string) {
    const getRfidUrl = `http://localhost:6005/devices/rfid/tag?tag=${rfid}`
    const response = await lastValueFrom(
      this.httpService.get(getRfidUrl).pipe(
        catchError((error) => {
          console.log(error);
          
          throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
        }
      ))
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('falha ao buscar tag', error);
    });
    
    if (!response.result) {
      throw new HttpException('RFID not found', HttpStatus.NOT_FOUND);
    }

    return await this.findUserAccess(environmentId, response.result)
  }

  async proccessAccessWhenMobile(environmentId: string, mobile: string) {
    console.log('MOBILE')
  }

  async proccessAccessWhenUserAndPassword(
    environmentId: string, user: string, password: string
  ) {
    const getUserUrl = 'http://localhost:6001/users/access'
    const response = await lastValueFrom(
      this.httpService.get(getUserUrl, {
        data: {
          user,
          password
        }
      })
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao enviar log', error);
    });

    if (response.result === 404) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else if (response.result === 401) {
      throw new HttpException('Invalid user password', HttpStatus.UNAUTHORIZED);
    }

    return await this.findUserAccess(environmentId, response.result)
  }

  async findUserAccess(environmentId: string, userId: string) {
    const getUserAccessUrl = 'http://localhost:6002/environments/env-access/access'
    const response = await lastValueFrom(
      this.httpService.get(getUserAccessUrl, {
        data: {
          userId: userId,
          environmentId: environmentId
        }
      }).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
        })
      )
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar acesso de usuário', error);
    })

    return response
  }
}
