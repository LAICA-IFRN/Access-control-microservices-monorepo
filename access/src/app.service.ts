import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccessDto } from './dto/access.dto';
import { catchError, lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class AppService {
  
  constructor(
    private readonly getEsp32Url = `${process.env.MICROCONTROLLERS_SERVICE_URL}/esp32/mac`,
    private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`,
    private readonly errorLogger = new Logger(),
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
    const { user, password, rfid, mobile, encoded } = accessDto

    if (rfid) {
      return this.proccessAccessWhenRFID(environmentId, rfid, encoded)
    } else if (mobile) {
      return this.proccessAccessWhenMobile(environmentId, mobile)
    } else {
      return await this.proccessAccessWhenUserAndPassword(environmentId, user, password, encoded)
    }
  }

  async proccessAccessWhenRFID(environmentId: string, rfid: string, captureEncodedImage: string) {
    const getRfidUrl = `${process.env.DEVICES_SERVICE_URL}/rfid/tag?tag=${rfid}`
    const response = await lastValueFrom(
      this.httpService.get(getRfidUrl).pipe(
        catchError((error) => {
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

    return await this.validateUserAccess(environmentId, response.result, captureEncodedImage)
  }

  async proccessAccessWhenMobile(environmentId: string, mobile: string) {
    console.log('MOBILE')
  }

  async proccessAccessWhenUserAndPassword(
    environmentId: string, user: string, password: string, captureEncodedImage: string
  ) {
    const getUserUrl = `${process.env.USERS_SERVICE_URL}}/access`
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
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso',
          type: 'Info',
          message: 'Acesso à ambiente negado: Usuário não encontrado',
          meta: {
            environmentId,
            user
          }
        })
      ).catch((error) => {
        this.errorLogger.error('Falha ao enviar log', error);
      })

      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else if (response.result === 401) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
          topic: 'Acesso',
          type: 'Info',
          message: 'Acesso à ambiente negado: Senha inválida',
          meta: {
            environmentId,
            user
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
    const verifyUserRoleUrl = `${process.env.USERS_SERVICE_URL}/roles/verify`
    const isFrequenter = await lastValueFrom(
      this.httpService.get(verifyUserRoleUrl, {
        data: {
          userId,
          roles: ['FREQUENTER']
        }
      }).pipe(
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
      lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
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
      const getUserAccessUrl = `${process.env.ENVIRONMENTS_SERVICE_URL}/env-access/access`
      accessResponse = await lastValueFrom(
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
    }

    if (accessResponse.access == false) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
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

    const userImagePath = await this.saveUserPhoto(userId)
    const captureImagePath = await this.saveCapturePhoto(captureEncodedImage)

    const facialRecognitionVerifyUrl = `${process.env.FACIAL_RECOGNITION_SERVICE_URL}/verify/user`
    const facialRecognition = await lastValueFrom(
      this.httpService.get(facialRecognitionVerifyUrl, {
        data: {
          capturedImagePath: captureImagePath,
          userImagePath: userImagePath
        }
      }).pipe(
        catchError((error) => {
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

    if (facialRecognition.result === false) {
      await lastValueFrom(
        this.httpService.post(this.createAuditLogUrl, {
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

  async saveUserPhoto(userId: string) {
    const getUserPhotoUrl = `${process.env.USERS_SERVICE_URL}/${userId}/photo`
    const userEncodedPhoto = await lastValueFrom(
      this.httpService.get(getUserPhotoUrl).pipe(
        catchError((error) => {
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
          this.httpService.post(this.createAuditLogUrl, {
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
          this.httpService.post(this.createAuditLogUrl, {
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
