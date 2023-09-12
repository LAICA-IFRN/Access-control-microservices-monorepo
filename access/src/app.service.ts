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

    const { ip, mac, environmentId } = esp32
    const { user, password, rfid, mobile } = accessDto

    if (rfid) {
      return this.proccessAccessWhenRFID(ip, mac, environmentId, rfid)
    } else if (mobile) {
      return this.proccessAccessWhenMobile(ip, mac, environmentId, mobile)
    } else {
      return this.proccessAccessWhenUserAndPassword(ip, mac, environmentId, user, password)
    }
  }

  async proccessAccessWhenRFID(
    ip: string, mac: string, environmentId: string, rfid: string
  ) {}

  async proccessAccessWhenMobile(
    ip: string, mac: string, environmentId: string, mobile: string
  ) {}

  async proccessAccessWhenUserAndPassword(
    ip: string, mac: string, environmentId: string, user: string, password: string
  ) {}
}
