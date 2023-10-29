import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccessDto } from './dto/access.dto';
import { catchError, lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { AccessLogService } from './providers/audit-log/audit-log.service';
import { AccessLogConstants } from './providers/audit-log/audit-contants';

@Injectable()
export class AppService {
  private readonly createAccessLog = process.env.CREATE_ACCESS_LOG_URL
  private readonly searchEsp32Url = process.env.SEARCH_ESP32_URL
  private readonly searchRFIDUrl = process.env.SEARCH_RFID_URL
  private readonly searchUserUrl = process.env.SEARCH_USER_URL
  private readonly searchUserAccessUrl = process.env.SEARCH_USER_ENV_ACCESS
  private readonly searchUserImageUrl = process.env.SEARCH_USER_IMAGE_URL
  private readonly verifyUserRoleUrl = process.env.VERIFY_USER_ROLE_URL
  private readonly facialRecognitionUrl = process.env.FACIAL_RECOGNITION_URL
  private readonly errorLogger = new Logger()
  
  constructor(
    private readonly httpService: HttpService,
    private readonly accessLogService: AccessLogService
  ) {}

  async access(accessDto: AccessDto) {
    const esp32: any = await lastValueFrom(
      this.httpService.get(this.searchEsp32Url, {
        data: {
          mac: accessDto.mac,
        }
      }).pipe(
        catchError((error) => {
          if (error.response.status === 404) {
            this.accessLogService.create(
              AccessLogConstants.accessDeniedWhenEsp32NotFound(
                null,
                null,
                null,
                {
                  mac: accessDto.mac
                }
              )
            )
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else if (error.response.status === 400) {
            this.accessLogService.create(
              AccessLogConstants.accessDeniedWhenEsp32MacAddressIsNotValid(
                null,
                null,
                null,
                {
                  mac: accessDto.mac
                }
              )
            )
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            this.accessLogService.create(AccessLogConstants.failedToProcessAccessRequest())
            this.errorLogger.error('Falha do sistema', error);
            throw new HttpException(error.response.data.message, HttpStatus.UNPROCESSABLE_ENTITY);
          }
        })
      )
    )
    
    const { environmentId } = esp32.data
    const { pin, rfid, mobile, encoded } = accessDto

    if (rfid) {
      return this.proccessAccessWhenRFID(environmentId, rfid, encoded)
    } else if (mobile) {
      return this.proccessAccessWhenMobile(environmentId, mobile)
    } else {
      return await this.proccessAccessWhenDocumentAndPassword(environmentId, pin, encoded)
    }
  }

  async proccessAccessWhenRFID(environmentId: string, rfid: string, captureEncodedImage: string) {
    const response = await lastValueFrom(
      this.httpService.get(this.searchRFIDUrl + rfid).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
        }
      ))
    )
    .then((response) => response.data)
    .catch((error) => {
      if (error.response.status === 404) {
        this.accessLogService.create(
          AccessLogConstants.accessDeniedWhenTagRFIDNotFound(
            'rfid',
            null,
            environmentId,
            {
              tag: rfid,
              captureEncodedImage
            }
          )
        )
        throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
      } else {
        this.accessLogService.create(AccessLogConstants.failedToProcessAccessRequest())
        this.errorLogger.error('Falha do sistema', error);
        throw new HttpException(error.response.data.message, HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });

    return await this.validateUserAccess(environmentId, response.result, captureEncodedImage)
  }

  async proccessAccessWhenMobile(environmentId: string, mobile: string) {
    console.log('MOBILE')
  }

  async proccessAccessWhenDocumentAndPassword(
    environmentId: string, pin: string, captureEncodedImage: string
  ) {
    const response = await lastValueFrom(
      this.httpService.get(this.searchUserUrl, {
        data: {
          pin
        }
      })
    )
    .then((response) => response.data)
    .catch((error) => {
      if (error.response.status === 404) {
        this.accessLogService.create(
          AccessLogConstants.accessDeniedWhenUserPinNotFound(
            'pin',
            null,
            environmentId,
            {
              pin,
              captureEncodedImage
            }
          )
        )
        throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
      } else if (error.response.status === 401) {
        this.accessLogService.create(
          AccessLogConstants.accessDeniedWhenUserPinIsNotValid(
            'pin',
            null,
            environmentId,
            {
              pin,
              captureEncodedImage
            }
          )
        )
        throw new HttpException(error.response.data.message, HttpStatus.UNAUTHORIZED);
      } else {
        this.accessLogService.create(AccessLogConstants.failedToProcessAccessRequest())
        this.errorLogger.error('Falha do sistema', error);
        throw new HttpException(error.response.data.message, HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });

    if (response.result === 404) {
      await lastValueFrom(
        this.httpService.post(this.createAccessLog, {
          topic: 'Acesso',
          type: 'Info',
          message: 'Acesso à ambiente negado: Usuário não encontrado',
          meta: {
            environmentId,
            pin
          }
        })
      ).catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      })

      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else if (response.result === 401) {
      await lastValueFrom(
        this.httpService.post(this.createAccessLog, {
          topic: 'Acesso',
          type: 'Info',
          message: 'Acesso à ambiente negado: Senha inválida',
          meta: {
            environmentId,
            pin
          }
        })
      ).catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      })
      
      throw new HttpException('Invalid user password', HttpStatus.UNAUTHORIZED);
    }

    return await this.validateUserAccess(environmentId, response.result, captureEncodedImage)
  }

  async validateUserAccess(environmentId: string, userId: string, captureEncodedImage: string) {
    const isFrequenter = await lastValueFrom(
      this.httpService.get(this.verifyUserRoleUrl, {
        data: {
          userId,
          roles: ['FREQUENTER']
        }
      }).pipe(
        catchError((error) => {
          console.log('get frequenter');
          console.log(error);
          
          if (error.response.status === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else if (error.response.status === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
          }
        })
      )
    )
    .then((response) => response.data)
    .catch((error) => {
      lastValueFrom(
        this.httpService.post(this.createAccessLog, {
          topic: 'Acesso',
          type: 'Error',
          message: 'Falha ao tentar acesso: Erro interno, verificar logs de erro do serviço',
          meta: {
            userId
          }
        })
      )
      .catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      });

      this.errorLogger.error('Falha ao buscar acesso de usuário', error);
    })

    let accessResponse = { access: false }
    if (isFrequenter) {
      console.log(userId, environmentId);
      
      accessResponse = await lastValueFrom(
        this.httpService.get(this.searchUserAccessUrl, {
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
    }

    if (isFrequenter && accessResponse.access == false) {
      console.log('frequenter false');
      await lastValueFrom(
        this.httpService.post(this.createAccessLog, {
          topic: 'Acesso',
          type: 'Info',
          message: 'Acesso à ambiente negado: Acesso não permitido',
          meta: {
            environmentId,
            userId
          }
        })
      ).catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      })

      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    const userImagePath = await this.saveUserImage(userId)
    const captureImagePath = await this.saveCapturePhoto(captureEncodedImage)

    const facialRecognition = await lastValueFrom(
      this.httpService.get(this.facialRecognitionUrl, {
        data: {
          capturedImagePath: captureImagePath,
          userImagePath: userImagePath
        }
      }).pipe(
        catchError((error) => {
          console.log('facial recognition');
          console.log(error);
          
          if (error.response.status === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
          }
        })
      )
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao realizar análise facial', error);
    })

    console.log(facialRecognition);
    

    if (facialRecognition.result === false) {
      console.log('facial recognition false');
      
      await lastValueFrom(
        this.httpService.post(this.createAccessLog, {
          topic: 'Acesso',
          type: 'Info',
          message: 'Acesso à ambiente negado: Análise facial não aprovada',
          meta: {
            environmentId,
            userId,
            captureEncodedImage
          }
        })
      ).catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      })

      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return { access: facialRecognition.result }
  }

  async saveUserImage(userId: string) {
    const getUserImage = `${this.searchUserImageUrl}/${userId}/image`
    const userEncodedPhoto = await lastValueFrom(
      this.httpService.get(getUserImage).pipe(
        catchError((error) => {
          console.log('get user image');
          console.log(error);
          
          if (error.response.status === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else if (error.response.status === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
          }
        })
      ).pipe(
        catchError((error) => {
          if (error.response.status === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else if (error.response.status === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
          }
        })
      )
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar foto do usuário', error);
    })

    const userImage = userEncodedPhoto.startsWith('data:image/') 
    ? userEncodedPhoto
    : `data:image/jpg;base64,${userEncodedPhoto}`;

    const matches = userImage.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    const imageExtension = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    const imageName = `${userId}.${imageExtension}`;
    const imagePath = `temp/${imageName}`;

    fs.writeFile(imagePath, imageBuffer, (err) => {
      if (err) {
        lastValueFrom(
          this.httpService.post(this.createAccessLog, {
            topic: 'Acesso',
            type: 'Error',
            message: 'Falha na escrita da imagem ao tentar acesso: Erro interno, verificar logs de erro do serviço',
            meta: {
              encodedImage: userEncodedPhoto
            }
          })
        ).catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        })

        this.errorLogger.error('Falha na escrita da imagem ao tentar acesso', err);
        
        throw err;
      }
    });

    return `access/temp/${imageName}`;
  }

  async saveCapturePhoto(captureEncodedImage: string) {
    const captureImage = captureEncodedImage.startsWith('data:image/') 
    ? captureEncodedImage
    : `data:image/jpg;base64,${captureEncodedImage}`;

    const matches = captureImage.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    const imageExtension = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    const imageName = `${randomUUID()}.${imageExtension}`;
    const imagePath = `temp/${imageName}`;

    fs.writeFile(imagePath, imageBuffer, (err) => {
      if (err) {
        lastValueFrom(
          this.httpService.post(this.createAccessLog, {
            topic: 'Acesso',
            type: 'Error',
            message: 'Falha na escrita da imagem ao tentar acesso: Erro interno, verificar logs de erro do serviço',
            meta: {
              encodedImage: captureEncodedImage
            }
          })
        ).catch((error) => {
          this.errorLogger.error('Falha ao enviar log', error);
        })

        this.errorLogger.error('Falha na escrita da imagem ao tentar acesso', err);

        throw err;
      }
    });

    return `access/temp/${imageName}`;
  }
}
