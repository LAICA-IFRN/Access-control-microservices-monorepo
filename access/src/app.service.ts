import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccessDto } from './dto/access.dto';
import { catchError, lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { AccessByType, AccessLogService } from './providers/audit-log/audit-log.service';
import { AccessLogConstants } from './providers/audit-log/audit-contants';
import { RoleEntity } from './utils/role.type';

@Injectable()
export class AppService {
  private readonly createAccessLog = process.env.CREATE_ACCESS_LOG_URL
  private readonly searchEsp32Url = process.env.SEARCH_ESP32_URL
  private readonly searchRFIDUrl = process.env.SEARCH_RFID_URL
  private readonly searchUserUrl = process.env.SEARCH_USER_URL
  private readonly searchUserAccessUrl = process.env.SEARCH_USER_ENV_ACCESS
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
    const { document, pin, rfid, mobile, encoded } = accessDto

    if (rfid) {
      return this.proccessAccessWhenRFID(environmentId, rfid, encoded)
    } else if (mobile) {
      return this.proccessAccessWhenMobile(environmentId, mobile, encoded)
    } else {
      return await this.proccessAccessWhenDocumentAndPassword(environmentId, document, pin, encoded)
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

    return await this.validateUser(environmentId, response.result, captureEncodedImage, 'rfid')
  }

  async proccessAccessWhenMobile(environmentId: string, mobile: string, captureEncodedImage: string) {
    console.log('MOBILE')
  }

  async proccessAccessWhenDocumentAndPassword(
    environmentId: string, document: string, pin: string, captureEncodedImage: string
  ) {
    const response = await lastValueFrom(
      this.httpService.get(this.searchUserUrl, {
        data: {
          document,
          pin
        }
      })
    )
    .then((response) => response.data)
    .catch((error) => {
      this.accessLogService.create(AccessLogConstants.failedToProcessAccessRequest())
      this.errorLogger.error('Falha do sistema', error);
      throw new HttpException(error.response.data.message, HttpStatus.UNPROCESSABLE_ENTITY);
    });

    if (response.result === 404) {
      this.accessLogService.create(
        AccessLogConstants.accessDeniedWhenUserDocumentNotFound(
          'pin',
          null,
          environmentId,
          {
            document,
            pin,
            captureEncodedImage
          }
        )
      )
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else if (response.result === 401) {
      this.accessLogService.create(
        AccessLogConstants.accessDeniedWhenUserPinIsNotValid(
          'pin',
          null,
          environmentId,
          {
            document,
            pin,
            captureEncodedImage
          }
        )
      )
      throw new HttpException('Invalid user pin', HttpStatus.UNAUTHORIZED);
    }

    return await this.validateUser(environmentId, response.result, captureEncodedImage, 'pin')
  }

  async validateUser(environmentId: string, userId: string, captureEncodedImage: string, accessType: AccessByType) {
    const getUserRolesUrl = `${process.env.SERVICE_USERS_URL}/${userId}/roles`;
    const userRoles: RoleEntity[] = await lastValueFrom(
      this.httpService.get(getUserRolesUrl).pipe(
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
      this.accessLogService.create(AccessLogConstants.failedToProcessAccessRequest())
      this.errorLogger.error('Falha ao buscar acesso de usuário', error);
    })

    const roles = userRoles.map((role) => role.role.name);
    let accessResponse = { access: false }

    if (roles.includes('ADMIN')) {
      accessResponse = await this.validateUserFacial(userId, environmentId, captureEncodedImage, accessType);

      if (accessResponse.access === false) {
        this.accessLogService.create(
          AccessLogConstants.accessDeniedWhenFacialRecognitionIsNotValid(
            accessType,
            userId,
            environmentId,
            {
              captureEncodedImage
            }
          )
        )
        throw new HttpException('Falha na análise facial', HttpStatus.UNAUTHORIZED);
      }
      
      // TODO: mds ajeita essa merda
    } else if (roles.includes('FREQUENTER')) {
      const hasEnvAccess = await lastValueFrom(
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

      if (hasEnvAccess.result === false) {
        this.accessLogService.create(
          AccessLogConstants.accessDeniedWhenEnvironmentAccessNotFound(
            accessType,
            userId,
            environmentId,
            {
              captureEncodedImage
            }
          )
        )
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      } else {
        accessResponse = await this.validateUserFacial(userId, environmentId, captureEncodedImage, accessType);
      }
    }

    return await this.validateUserFacial(userId, environmentId, captureEncodedImage,  accessType);
  }

  async validateUserFacial(userId: string, environmentId: string, captureEncodedImage: string, accessType: AccessByType) {
    const userImagePath = await this.saveUserImage(userId)
    const captureImagePath = await this.saveAccessImage(captureEncodedImage)

    const facialRecognition = await lastValueFrom(
      this.httpService.get(this.facialRecognitionUrl, {
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
      this.accessLogService.create(
        AccessLogConstants.accessDeniedWhenFacialRecognitionIsNotValid(
          accessType,
          userId,
          environmentId,
          {
            captureEncodedImage
          }
        )
      )
      throw new HttpException('Falha na análise facial', HttpStatus.UNAUTHORIZED);
    }

    return { access: facialRecognition.result }
  }

  async saveUserImage(userId: string) {
    const getUserImage = `${this.searchUserUrl}/${userId}/image`
    const userEncodedPhoto = await lastValueFrom(
      this.httpService.get(getUserImage).pipe(
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

  async saveAccessImage(captureEncodedImage: string) {
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
