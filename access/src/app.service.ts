import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccessDto } from './dto/access.dto';
import { catchError, lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { AccessLogService } from './providers/audit-log/audit-log.service';
import { AccessLogConstants } from './providers/audit-log/audit-contants';
import { RoleEntity } from './utils/role.type';
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
      throw new HttpException('Esp32 not found', HttpStatus.NOT_FOUND);
    }

    const { environmentId } = esp32;

    const userIdAndAccessType = await this.getUserIdAndAccessType(accessDto);

    if (!userIdAndAccessType.userId) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const userAccess = await this.getEnvironmentAccess(userIdAndAccessType.userId, environmentId);

    return userAccess
  }

  async getUserIdAndAccessType(accessDto: AccessDto) {
    let response: any = {};

    if (accessDto.rfid) {
      response.userId = await this.getUserIdByRFID(accessDto.rfid);
      response.accessBy = AccessByType.rfid;
    } else if (accessDto.mobile) {
      response.userId = await this.getUserIdByMobile(accessDto.mobile);
      response.accessBy = AccessByType.app;
    } else {
      response.userId = await this.getUserIdByDocumentAndPin(accessDto.document, accessDto.pin);
      response.accessBy = AccessByType.document;
    }

    return response;
  }

  async getEsp32(mac: string) {
    const esp32: any = await lastValueFrom(
      this.httpService.get(this.searchEsp32Url, {
        data: { mac }
      }).pipe(
        catchError((error) => {
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

    if (!data.userId) {
      throw new HttpException('Tag RFID não encontrada', HttpStatus.NOT_FOUND);
    }

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

    if (!data.userId) {
      // this.accessLogService.create(
      //   AccessLogConstants.accessDeniedWhenDeviceMobileNotFound(
      //     'app',
      //     null,
      //     null,
      //     {
      //       mac
      //     }
      //   )
      // )
      throw new HttpException('Aparelho não encontrado', HttpStatus.NOT_FOUND);
    }

    return data.userId;
  }

  async getUserIdByDocumentAndPin(document: string, pin: string) {
    const data: { result: any } = await lastValueFrom(
      this.httpService.get(this.searchUserUrl, {
        data: { document, pin }
      }).pipe(
        catchError((error) => {
          console.log(error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    if (data.result === 404) {
      // this.accessLogService.create(
      //   AccessLogConstants.accessDeniedWhenUserDocumentNotFound(
      //     'pin',
      //     null,
      //     null,
      //     {
      //       document,
      //       pin
      //     }
      //   )
      // )

      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (data.result === 401) {
      throw new HttpException('PIN inválido', HttpStatus.UNAUTHORIZED);
    }

    return data.result;
  }
  
  async getEnvironmentAccess(userId: string, environmentId: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchUserAccessUrl, {
        data: {
          userId,
          environmentId
        }
      }).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    if (!data.access) {
      throw new HttpException('Usuário não possui acesso ao ambiente', HttpStatus.FORBIDDEN);
    }

    return data;
  }

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

    // TODO: testas sem esse processo de validação do prefixo
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
