import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccessDto } from './dto/access.dto';
import { catchError, lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { AccessLogService } from './providers/audit-log/audit-log.service';
import { AccessLogConstants } from './providers/audit-log/audit-contants';
import { AccessByType } from './providers/constants';

@Injectable()
export class AppService {
  private readonly createAccessLog = process.env.CREATE_ACCESS_LOG_URL
  private readonly searchEsp32Url = process.env.SEARCH_ESP32_URL
  private readonly searchRFIDUrl = process.env.SEARCH_RFID_URL
  private readonly searchUserUrl = process.env.SEARCH_USER_URL
  private readonly searchMobileUrl = process.env.SEARCH_MOBILE_URL
  private readonly searchUserAccessUrl = process.env.SEARCH_USER_ENV_ACCESS
  private readonly facialRecognitionUrl = process.env.FACIAL_RECOGNITION_URL
  private readonly errorLogger = new Logger()
  
  constructor(
    private readonly httpService: HttpService,
    private readonly accessLogService: AccessLogService
  ) {}

  async access(accessDto: AccessDto) {
    const esp32 = await this.getEsp32(accessDto.mac);

    if (!esp32) {
      this.sendLogWhenEsp32NotFound(accessDto);
      throw new HttpException('Esp32 not found', HttpStatus.NOT_FOUND);
    }

    const { environmentId } = esp32;
    const userData = await this.getUserIdAndAccessType(accessDto, environmentId);
    const userAccessData = await this.getEnvironmentAccess(userData, environmentId, accessDto);

    const facialRecognition = await this.validateUserFacial(userData.userId, accessDto.encoded);

    // TODO: criar funções para mandar log quando a analise falha e quando ocorrer corretamente
  }

  async sendLogWhenEsp32NotFound(accessDto: AccessDto) {
    let accessType: any;

    if (accessDto.rfid) {
      accessType = AccessByType.rfid;
    } else if (accessDto.mobile) {
      accessType = AccessByType.app;
    } else {
      accessType = AccessByType.document;
    }

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenEsp32NotFound(
        accessType,
        accessDto.mac,
        {
          ip: accessDto.ip,
          mac: accessDto.mac,
          encoded: accessDto.encoded,
        }
      )
    )
  }

  async getUserIdAndAccessType(accessDto: AccessDto, environmentId: string) {
    const userData: any = { userId: null, accessType: null };

    if (accessDto.rfid) {
      userData.userId = await this.getUserIdByRFID(accessDto.rfid);

      if (!userData) {
        this.sendLogWhenRFIDNotFound(accessDto, environmentId);
        throw new HttpException('Tag RFID não encontrada', HttpStatus.NOT_FOUND);
      }

      userData.accessType = AccessByType.rfid;
    } else if (accessDto.mobile) {
      userData.userId = await this.getUserIdByMobile(accessDto.mobile);
      
      if (!userData) {
        this.sendLogWhenMobileNotFound(accessDto, environmentId);
        throw new HttpException('Dispositivo móvel não encontrado', HttpStatus.NOT_FOUND);
      }

      userData.accessType = AccessByType.app;
    } else {
      const response: any = await this.getUserIdByDocumentAndPin(accessDto.document, accessDto.pin);
      
      if (response.statusCode === 404) {
        this.sendLogWhenUserDocumentNotFound(accessDto, environmentId);
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
  
      if (response.statusCode === 401) {
        this.sendLogWhenUserPinIsNotValid(accessDto, environmentId, response.userName, response.userId);
        throw new HttpException('PIN inválido', HttpStatus.UNAUTHORIZED);
      }
  
      userData.userId = response.userId;
      userData.accessType = AccessByType.document;
      userData.userName = response.userName;
    }

    return userData;
  }

  async sendLogWhenRFIDNotFound(accessDto: AccessDto, environmentId: string) {
    const environment = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_ENVIRONMENTS_URL}/env/${environmentId}`)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar ambiente', error);
    })

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenTagRFIDNotFound(
        accessDto.rfid,
        environment.name,
        {
          ...AccessDto,
          environmentId
        }
      )
    )
  }

  async sendLogWhenMobileNotFound(accessDto: AccessDto, environmentId: string) {
    const environment = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_ENVIRONMENTS_URL}/env/${environmentId}`)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar ambiente', error);
    })

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenDeviceMobileNotFound(
        accessDto.mac,
        environment.name,
        {
          ...AccessDto,
          environmentId
        }
      )
    )
  }

  async sendLogWhenUserPinIsNotValid(accessDto: AccessDto, environmentId: string, userName: string, userId: string) {
    const environment = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_ENVIRONMENTS_URL}/env/${environmentId}`)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar ambiente', error);
    })

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenUserPinIsNotValid(
        accessDto.pin,
        userName,
        environment.name,
        {
          ...AccessDto,
          environmentId,
          userId
        }
      )
    )
  }

  async sendLogWhenUserDocumentNotFound(accessDto: AccessDto, environmentId: string) {
    const environment = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_ENVIRONMENTS_URL}/env/${environmentId}`)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar ambiente', error);
    })

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenUserDocumentNotFound(
        accessDto.document,
        environment.name,
        {
          ...AccessDto,
          environmentId
        }
      )
    )
  }

  async getEsp32(mac: string) {
    const esp32: any = await lastValueFrom(
      this.httpService.get(this.searchEsp32Url, {
        data: { mac }
      }).pipe(
        catchError((error) => {
          this.errorLogger.error('Falha ao buscar esp32', error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)
    
    return esp32;
  }

  async getUserIdByRFID(tag: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchRFIDUrl + tag).pipe(
        catchError((error) => {
          console.log(error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    return data.userId;
  }

  async getUserIdByMobile(mac: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchMobileUrl + mac).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    return data.userId;
  }

  async getUserIdByDocumentAndPin(document: string, pin: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchUserUrl, {
        data: { document, pin }
      }).pipe(
        catchError((error) => {
          console.log(error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    return data;
  }
  
  async getEnvironmentAccess(userData: any, environmentId: string, accessDto: AccessDto) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchUserAccessUrl, {
        data: {
          userId: userData.userId,
          environmentId
        }
      }).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    if (!data.access) {
      this.accessLogService.create(
        AccessLogConstants.accessDeniedWhenEnvironmentAccessNotFound(
          userData.userName,
          data.environmentName,
          userData.accessType,
          {
            ...accessDto,
            userId: userData.userId,
            environmentId
          }
        )
      )
      throw new HttpException('Usuário não possui acesso ao ambiente', HttpStatus.UNAUTHORIZED);
    }

    return data;
  }

  async sendLogWhenUserAccessIsFalse() {}

  async validateUserFacial(userId: string, captureEncodedImage: string) {
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
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    return facialRecognition;
  }

  async saveUserImage(userId: string) {
    const getUserImage = `${this.searchUserUrl}/${userId}/image`
    const userEncodedPhoto = await lastValueFrom(this.httpService.get(getUserImage))
      .then((response) => response.data)

    // TODO: testar sem esse processo de validação do prefixo
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
        this.accessLogService.create(
          AccessLogConstants.failedToWriteUserImageToDisk(
            null,
            userId,
            null,
            {
              encodedImage: userEncodedPhoto
            }
          )
        )

        this.errorLogger.error('Falha na escrita da imagem ao tentar acesso', err);
        
        throw err;
      }
    });
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
        this.accessLogService.create(
          AccessLogConstants.failedToWriteAccessImageToDisk(
            null,
            null,
            null,
            {
              encodedImage: captureEncodedImage
            }
          )
        )

        this.errorLogger.error('Falha na escrita da imagem ao tentar acesso', err);

        throw err;
      }
    });

    return `access/temp/${imageName}`;
  }
}
