import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccessByMicrocontrollerDeviceDto } from './dto/access-by-microcontroller-device.dto';
import { catchError, lastValueFrom } from 'rxjs';
// import * as fs from 'fs';
// import { randomUUID } from 'crypto';
import { AccessLogService } from './providers/audit-log/audit-log.service';
import { AccessLogConstants } from './providers/audit-log/audit-contants';
import { AccessByType, Roles } from './providers/constants';
import { AccessByMobileDeviceDto } from './dto/access-by-mobile-device.dto';

@Injectable()
export class AppService {
  private readonly searchEsp32Url = process.env.SEARCH_ESP32_URL
  private readonly searchRFIDUrl = process.env.SEARCH_RFID_URL
  private readonly searchUserUrl = process.env.SEARCH_USER_URL
  private readonly searchMobileUrl = process.env.SEARCH_MOBILE_URL
  private readonly searchFrequenterAccessUrl = process.env.SEARCH_FREQUENTER_ACCESS
  private readonly searchManagerAccessUrl = process.env.SEARCH_MANAGER_ACCESS
  private readonly searchEspInMobileAccessUrl = process.env.SEARCH_ESP_IN_MOBILE_ACCESS
  private readonly facialRecognitionUrl = process.env.FACIAL_RECOGNITION_URL
  private readonly authorizeMobileAccessUrl = process.env.AUTHORIZE_MOBILE_ACCESS_URL
  private readonly envServiceUrl = process.env.SERVICE_ENVIRONMENTS_URL
  private readonly errorLogger = new Logger()

  private readonly tempGetRolesUrl = process.env.TEMP_GET_ROLES;
  private readonly tempGetEsp = process.env.TEMP_GET_ESP;

  constructor(
    private readonly httpService: HttpService,
    private readonly accessLogService: AccessLogService
  ) { }

  // async accessByMicrocontrollerDevice(accessDto: AccessByMicrocontrollerDeviceDto) {
  //   const esp32 = await this.getEsp32(accessDto.mac);

  //   if (!esp32) {
  //     this.sendLogWhenEsp32NotFound(accessDto);
  //     throw new HttpException('Esp32 não encontrado', HttpStatus.NOT_FOUND);
  //   }

  //   const { environmentId } = esp32;
  //   const userData = await this.getUserIdAndAccessType(accessDto, environmentId);
  //   const userRoles: string[] = await this.getUserRoles(userData.userId);

  //   if (userRoles.includes(Roles.ADMIN)) {
  //     return await this.handleAdminFacialRecognition(userData, environmentId, accessDto)
  //   }

  //   let userAccessData: any;

  //   if (userRoles.includes(Roles.FREQUENTER)) {
  //     userAccessData = await this.searchFrequenterAccess(userData, environmentId, accessDto);
  //     if (userAccessData.access) {
  //       return await this.handleUserFacialRecognitionDevice(userData, userAccessData, accessDto);
  //     }
  //   }

  //   if (userRoles.includes(Roles.ENVIRONMENT_MANAGER)) {
  //     userAccessData = await this.searchEnvironmentManagerAccess(userData, environmentId, accessDto);
  //     if (userAccessData.access) {
  //       return await this.handleUserFacialRecognitionDevice(userData, userAccessData, accessDto);
  //     }
  //   }

  //   this.handleUnauthorizedUserAccess(userData, userAccessData, accessDto, environmentId);
  // }

  // async accessByMobileDevice(accessDto: AccessByMobileDeviceDto) {
  //   const tokenData = await lastValueFrom(
  //     this.httpService.get(`${this.authorizeMobileAccessUrl}?token=${accessDto.token}`)
  //   )
  //   .then((response) => response.data)
  //   .catch((error) => {
  //     this.errorLogger.error('Falha ao verificar token', error);
  //     throw new HttpException(error.response.data.message, error.response.data.statusCode);
  //   })

  //   const { id, role } = tokenData;

  //   if (role === 'ADMIN') {
  //     if (!accessDto.fingerprint) {
  //       return this.handleAdminFacialRecognition({ userId: accessDto.userId, accessType: AccessByType.app }, tokenData.env, accessDto);
  //     }

  //     await this.sendRemoteAccessRequest(tokenData.env, accessDto.espId, accessDto.userId);
  //     return { access: true };
  //   }

  //   if (role === 'FREQUENTER') {
  //     const data: any = await lastValueFrom(
  //       this.httpService.get(`${this.searchFrequenterMobileAccessUrl}/${id}`)
  //     )
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       this.errorLogger.error('Falha ao buscar acesso de frequenter', error);
  //       throw new HttpException(error.response.data.message, error.response.data.statusCode);
  //     })

  //     if (!accessDto.fingerprint) {
  //       return this.handleUserFacialRecognitionMobile({ userId: accessDto.userId, accessType: AccessByType.app }, data, accessDto);
  //     }

  //     if (data.access) {
  //       await this.sendRemoteAccessRequest(data.environmentId, accessDto.espId, accessDto.userId);
  //       return { access: true };
  //     }

  //     this.sendLogWhenFingerprintFails({ userId: accessDto.userId, accessType: AccessByType.app }, data, accessDto);
  //     return { access: false };
  //   }

  //   if (role === 'ENVIRONMENT_MANAGER') {
  //     const data: any = await lastValueFrom(
  //       this.httpService.get(`${this.searchManagerMobileAccessUrl}/${id}`)
  //     )
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       this.errorLogger.error('Falha ao buscar acesso de gerente de ambiente', error);
  //       throw new HttpException(error.response.data.message, error.response.data.statusCode);
  //     })

  //     if (!accessDto.fingerprint) {
  //       return this.handleUserFacialRecognitionMobile({ userId: accessDto.userId, accessType: AccessByType.app }, data, accessDto);
  //     }

  //     if (data.access) {
  //       await this.sendRemoteAccessRequest(data.environmentId, accessDto.espId, accessDto.userId);
  //       return { access: true };
  //     }

  //     this.sendLogWhenFingerprintFails({ userId: accessDto.userId, accessType: AccessByType.app }, data, accessDto);
  //     return { access: false };
  //   }
  // }

  async accessByMicrocontrollerDeviceTEMP(accessDto: AccessByMicrocontrollerDeviceDto) {
    const esp32 = await this.getEsp32(accessDto.mac);

    if (!esp32) {
      this.sendLogWhenEsp32NotFound(accessDto);
      throw new HttpException('Esp32 não encontrado', HttpStatus.NOT_FOUND);
    }

    const { environmentId } = esp32;
    const userData = await this.getUserIdAndAccessType(accessDto, environmentId);
    const userRoles: string[] = await this.getUserRoles(userData.userId);

    if (userRoles.includes(Roles.ADMIN)) {
      this.handleLogAdminFacialRecognitionWeb(userData, { result: true }, environmentId, accessDto);
      return { access: true };
    }

    let userAccessData: any;

    if (userRoles.includes(Roles.FREQUENTER)) {
      userAccessData = await this.searchFrequenterAccess(userData.userId, environmentId);
      this.sendLogWhenFacialRecognitionSucceeds(userData, userAccessData, accessDto);
      return { access: true };
    }

    if (userRoles.includes(Roles.ENVIRONMENT_MANAGER)) {
      userAccessData = await this.searchEnvironmentManagerAccess(userData.userId, environmentId);
      this.sendLogWhenFacialRecognitionSucceeds(userData, userAccessData, accessDto);
      return { access: true };
    }

    this.handleUnauthorizedUserAccess(userData, userAccessData, accessDto, environmentId);
  }

  async accessByMobileDeviceTEMP(accessDto: AccessByMobileDeviceDto) {
    const esp = await lastValueFrom(
      this.httpService.get(`${this.tempGetEsp}/${accessDto.environmentId}`)
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar esp', error);
      throw new HttpException(error.response.data.message, error.response.data.statusCode);
    })

    const mobile = await this.getMobileData(accessDto.mobileId);

    if (!mobile.active) {
      this.accessLogService.create({
        type: 'Error',
        message: 'Tentativa de acesso por um dispositivo móvel inativo',
        meta: {
          mobileId: accessDto.mobileId,
          userId: accessDto.userId,
        }
      })

      throw new HttpException('Dispositivo móvel inativo', HttpStatus.FORBIDDEN);
    }
      
    const roles: string[] = await lastValueFrom(
      this.httpService.get(`${this.tempGetRolesUrl}/${accessDto.userId}/all`)
    )
    .then((response) => response.data.roles)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar papéis do usuário', error);
      throw new HttpException(error.response.data.message, error.response.data.statusCode);
    })

    let userData: any;
    
    if (roles.includes('ADMIN')) {
      this.handleLogAdminFacialRecognitionMobile({ userId: accessDto.userId, accessType: AccessByType.app }, { result: true }, esp.environment_id, accessDto);

      await this.sendRemoteAccessRequest(esp.environment_id, esp.id, accessDto.userId);
      return { access: true };
    }

    if (roles.includes('FREQUENTER')) {
      const data = await this.searchFrequenterAccess(accessDto.userId, accessDto.environmentId);
      if (data) {
        userData = data;
      }
      
      if (data?.access) {
        await this.sendRemoteAccessRequest(accessDto.environmentId, esp.id, accessDto.userId);
        return { access: true };
      }
    }
    
    if (roles.includes('ENVIRONMENT_MANAGER')) {
      const data = await this.searchEnvironmentManagerAccess(accessDto.userId, accessDto.environmentId);

      if (data) {
        userData = data;
      }

      if (data?.access) {
        await this.sendRemoteAccessRequest(accessDto.environmentId, esp.id, accessDto.userId);
        return { access: true };
      }
    }

    this.sendLogWhenFingerprintFails({ userId: accessDto.userId, accessType: AccessByType.app }, userData, accessDto);
    return { access: false };
}

  private async getMobileData(mobileId: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(`${this.searchMobileUrl}/${mobileId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar dispositivo móvel', error);
        throw new HttpException(error.response.data.message, error.response.data.statusCode);
      })

    return data;
  }

  private async sendRemoteAccessRequest(environmentId: string, esp8266Id: number, userId: string) {
    const url = `${this.envServiceUrl}/env/remote-access?environmentId=${environmentId}&esp8266Id=${esp8266Id}&userId=${userId}&type=mobile`;
    const data: any = await lastValueFrom(this.httpService.post(url))
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao solicitar acesso remoto', error);
        throw new HttpException(error.response.data.message, error.response.data.statusCode);
      })

    return data;
  }

  async searchEnvironmentByQRCode(qrCode: string) {
    const id = qrCode.slice(-1);

    const data: any = await lastValueFrom(
      this.httpService.get(`${this.searchEspInMobileAccessUrl}/${id}`).pipe(
        catchError((error) => {
          this.errorLogger.error('Falha ao buscar ambiente por QR Code', error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    const qrcodeWithoutId = qrCode.slice(0, -1);

    return {
      espId: id,
      qrCodeMatch: qrcodeWithoutId === data.qrcode,
      environmentId: data.environmentId
    };
  }

  // private async handleUserFacialRecognitionDevice(userData: any, userAccessData: any, accessDto: any) {
  //   const facialRecognition = await this.validateUserFacial(userData.userId, accessDto.encoded);

  //   if (facialRecognition.error) {
  //     this.sendLogWhenFacialRecognitionFails(userData, userAccessData, accessDto);
  //     throw new HttpException(facialRecognition.error, facialRecognition.statusCode);
  //   }

  //   if (facialRecognition.result === false) {
  //     this.sendLogWhenFacialRecognitionFails(userData, userAccessData, accessDto);
  //     return { access: false };
  //   } else {
  //     this.sendLogWhenFacialRecognitionSucceeds(userData, userAccessData, accessDto);
  //     return { access: true };
  //   }
  // }

  // private async handleUserFacialRecognitionMobile(userData: any, userAccessData: any, accessDto: any) {
  //   const facialRecognition = await this.validateUserFacial(userData.userId, accessDto.encoded);

  //   if (facialRecognition.error) {
  //     this.sendLogWhenFacialRecognitionFails(userData, userAccessData, accessDto);
  //     throw new HttpException(facialRecognition.error, facialRecognition.statusCode);
  //   }

  //   this.handleLogAdminFacialRecognitionMobile(userData, facialRecognition, userAccessData.environmentId, accessDto);

  //   if (facialRecognition.result === false) {
  //     return { access: false };
  //   } else {
  //     return { access: true };
  //   }
  // }

  // private async handleAdminFacialRecognition(userData: any, environmentId: string, accessDto: any, ) {
  //   const facialRecognition = await this.validateUserFacial(userData.userId, accessDto.encoded);

  //   if (userData.accessType === AccessByType.app) {
  //     this.handleLogAdminFacialRecognitionMobile(userData, facialRecognition, environmentId, accessDto);
  //   } else {
  //     this.handleLogAdminFacialRecognitionWeb(userData, facialRecognition, environmentId, accessDto);
  //   }

  //   return { access: facialRecognition.result };
  // }

  private async handleLogAdminFacialRecognitionMobile(userData: any, facialRecognition: any, environmentId: string, accessDto: any) {
    const environment = await this.getEnvironmentDataToLog(environmentId);

    const user = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_USERS_URL}/${userData.userId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar usuário', error);
      })


    if (facialRecognition.result === false) {
      this.accessLogService.create(
        AccessLogConstants.accessFailedWhenMobileRequest(
          user.name,
          environment.name,
          userData.accessType,
          {
            ...accessDto,
            userId: user.id,
            environmentId
          }
        )
      )
    } else {
      await this.sendRemoteAccessRequest(environmentId, accessDto.espId, userData.userId);
    }
  }

  private async handleLogAdminFacialRecognitionWeb(userData: any, facialRecognition: any, environmentId: string, accessDto: any) {
    const environment = await this.getEnvironmentDataToLog(environmentId);
    const environmentDataForLog = {
      environmentId,
      environmentName: environment.name
    }

    if (facialRecognition.result === false) {
      this.sendLogWhenFacialRecognitionFails(userData, environmentDataForLog, accessDto);
    } else {
      this.sendLogWhenFacialRecognitionSucceeds(userData, environmentDataForLog, accessDto);
    }
  }

  async getUserRoles(userId: string) {
    const getUserRolesUrl = `${process.env.SERVICE_USERS_URL}/roles/${userId}/all`;
    const data = await lastValueFrom(
      this.httpService.get(getUserRolesUrl).pipe(
        catchError((error) => {
          this.errorLogger.error('Falha ao buscar papéis do usuário', error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    return data.roles;
  }

  async getUserIdAndAccessType(accessDto: AccessByMicrocontrollerDeviceDto, environmentId: string) {
    const userData: any = { userId: null, accessType: null };

    if (accessDto.rfid) {
      userData.userId = await this.getUserIdByRFID(accessDto.rfid);

      if (!userData.userId) {
        this.sendLogWhenRFIDNotFound(accessDto, environmentId);
        throw new HttpException('Tag RFID não encontrada', HttpStatus.NOT_FOUND);
      }

      userData.accessType = AccessByType.rfid;
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

  async getEsp32(mac: string) {
    const esp32: any = await lastValueFrom(
      this.httpService.get(this.searchEsp32Url, {
        data: { mac }
      }).pipe(
        catchError((error) => {
          this.errorLogger.error('Falha ao buscar esp32', error);
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    ).then((response) => response.data)

    return esp32;
  }

  async getUserIdByRFID(tag: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchRFIDUrl + tag).pipe(
        catchError((error) => {
          this.errorLogger.error('Falha ao buscar RFID', error);
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
          this.errorLogger.error('Falha ao buscar usuário', error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    return data;
  }

  async searchFrequenterAccess(userId: string, environmentId: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchFrequenterAccessUrl, {
        data: {
          userId: userId,
          environmentId
        }
      })
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar acesso de frequentador', error);
      throw new HttpException(error.response.data.message, error.response.data.statusCode);
    })

    return data;
  }

  async searchEnvironmentManagerAccess(userId: string, environmentId: string) {
    const data: any = await lastValueFrom(
      this.httpService.get(this.searchManagerAccessUrl, {
        data: {
          userId: userId,
          environmentId
        }
      })
    )
    .then((response) => response.data)
    .catch((error) => {
      this.errorLogger.error('Falha ao buscar acesso de gerente de ambiente', error);
      throw new HttpException(error.response.data.message, error.response.data.statusCode);
    })

    return data;
  }

  private handleUnauthorizedUserAccess(userData: any, data: any, accessDto: any, environmentId: string) {
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
    );
    throw new HttpException('Usuário não possui acesso ao ambiente', HttpStatus.UNAUTHORIZED);
  }

  // async validateUserFacial(userId: string, captureEncodedImage: string) {
  //   const userImagePath = await this.saveUserImage(userId)
  //   const captureImagePath = await this.saveAccessImage(captureEncodedImage)

  //   const facialRecognition = await lastValueFrom(
  //     this.httpService.get(this.facialRecognitionUrl, {
  //       data: {
  //         capturedImagePath: captureImagePath,
  //         userImagePath: userImagePath
  //       }
  //     }).pipe(
  //       catchError((error) => {
  //         this.errorLogger.error('Falha ao validar reconhecimento facial', error);
  //         throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //       })
  //     )
  //   ).then((response) => response.data)

  //   return facialRecognition;
  // }

  // async saveUserImage(userId: string) {
  //   const getUserImageUrl = `${process.env.SERVICE_USERS_URL}/${userId}/image`;
  //   const userEncodedImage = await lastValueFrom(this.httpService.get(getUserImageUrl)).then((response) => response.data)

  //   // TODO: testar sem esse processo de validação do prefixo
  //   const userImage = userEncodedImage.startsWith('data:image/') 
  //   ? userEncodedImage
  //   : `data:image/jpg;base64,${userEncodedImage}`;

  //   const matches = userImage.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  //   const imageExtension = matches[1];
  //   const imageBuffer = Buffer.from(matches[2], 'base64');

  //   const imageName = `${userId}.${imageExtension}`;
  //   const imagePath = `temp/${imageName}`;

  //   fs.writeFile(imagePath, imageBuffer, (err) => {
  //     if (err) {
  //       this.accessLogService.create(
  //         AccessLogConstants.failedToWriteUserImageToDisk(
  //           null,
  //           userId,
  //           null,
  //           {
  //             encodedImage: userEncodedImage
  //           }
  //         )
  //       )

  //       this.errorLogger.error('Falha na escrita da imagem ao tentar acesso', err);

  //       throw err;
  //     }
  //   });

  //   return `access/temp/${imageName}`;
  // }

  // async saveAccessImage(captureEncodedImage: string) {
  //   const captureImage = captureEncodedImage.startsWith('data:image/')
  //   ? captureEncodedImage
  //   : `data:image/jpg;base64,${captureEncodedImage}`;

  //   const matches = captureImage.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  //   const imageExtension = matches[1];
  //   const imageBuffer = Buffer.from(matches[2], 'base64');

  //   const imageName = `${randomUUID()}.${imageExtension}`;
  //   const imagePath = `temp/${imageName}`;

  //   fs.writeFile(imagePath, imageBuffer, (err) => {
  //     if (err) {
  //       this.accessLogService.create(
  //         AccessLogConstants.failedToWriteAccessImageToDisk(
  //           null,
  //           null,
  //           null,
  //           {
  //             encodedImage: captureEncodedImage
  //           }
  //         )
  //       )

  //       this.errorLogger.error('Falha na escrita da imagem ao tentar acesso', err);

  //       throw err;
  //     }
  //   });

  //   return `access/temp/${imageName}`;
  // }

  async sendLogWhenFacialRecognitionSucceeds(userData: any, userAccessData: any, accessDto: any) { // AccessByMicrocontrollerDeviceDto
    const user = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_USERS_URL}/${userData.userId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar usuário', error);
      })

    this.accessLogService.create(
      AccessLogConstants.accessOkWhenUserHasAccess(
        user.name,
        userAccessData.environmentName,
        userData.accessType,
        {
          ...accessDto,
          userId: userData.userId,
          environmentId: userAccessData.environmentId
        }
      )
    )
  }

  async sendLogWhenFingerprintSucceeds(userData: any, envId: any, accessDto: any) {
    const user = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_USERS_URL}/${userData.userId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar usuário', error);
      })

    const environment = await this.getEnvironmentDataToLog(envId);

    this.accessLogService.create(
      AccessLogConstants.accessOkWhenMobileRequest(
        user.name,
        environment.name,
        userData.accessType,
        {
          ...accessDto,
          userId: userData.userId,
          environmentId: environment.id
        }
      )
    )
  }

  async sendLogWhenFingerprintFails(userData: any, userAccessData: any, accessDto: any) {
    const user = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_USERS_URL}/${userData.userId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar usuário', error);
      })

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenEnvironmentAccessNotFound(
        user.name,
        userAccessData.environmentName,
        userData.accessType,
        {
          ...accessDto,
          userId: userData.userId,
          environmentId: userAccessData.environmentId
        }
      )
    )
  }

  async sendLogWhenFacialRecognitionFails(userData: any, userAccessData: any, accessDto: AccessByMicrocontrollerDeviceDto) {
    const user = await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_USERS_URL}/${userData.userId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar usuário', error);
      })

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenFacialRecognitionIsNotValid(
        user.name,
        userAccessData.environmentName,
        userData.accessType,
        {
          ...accessDto,
          userId: userData.userId,
          environmentId: userAccessData.environmentId
        }
      )
    )
  }

  async sendLogWhenEsp32NotFound(accessDto: AccessByMicrocontrollerDeviceDto) {
    let accessType: any;

    if (accessDto.rfid) {
      accessType = AccessByType.rfid;
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
          //encoded: accessDto.encoded,
        }
      )
    )
  }

  async sendLogWhenRFIDNotFound(accessDto: AccessByMicrocontrollerDeviceDto, environmentId: string) {
    const environment = await this.getEnvironmentDataToLog(environmentId)

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenTagRFIDNotFound(
        accessDto.rfid,
        environment.name,
        {
          ...accessDto,
          environmentId
        }
      )
    )
  }

  async sendLogWhenMobileNotFound(accessDto: AccessByMicrocontrollerDeviceDto, environmentId: string) {
    const environment = await this.getEnvironmentDataToLog(environmentId)

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenDeviceMobileNotFound(
        accessDto.mac,
        environment.name,
        {
          ...accessDto,
          environmentId
        }
      )
    )
  }

  async sendLogWhenUserPinIsNotValid(accessDto: AccessByMicrocontrollerDeviceDto, environmentId: string, userName: string, userId: string) {
    const environment = await this.getEnvironmentDataToLog(environmentId)

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenUserPinIsNotValid(
        accessDto.pin,
        userName,
        environment.name,
        {
          ...accessDto,
          environmentId,
          userId
        }
      )
    )
  }

  async sendLogWhenUserDocumentNotFound(accessDto: AccessByMicrocontrollerDeviceDto, environmentId: string) {
    const environment = await this.getEnvironmentDataToLog(environmentId)

    this.accessLogService.create(
      AccessLogConstants.accessDeniedWhenUserDocumentNotFound(
        accessDto.document,
        environment.name,
        {
          ...AccessByMicrocontrollerDeviceDto,
          environmentId
        }
      )
    )
  }

  private async getEnvironmentDataToLog(environmentId: string) {
    return await lastValueFrom(
      this.httpService.get(`${process.env.SERVICE_ENVIRONMENTS_URL}/env/${environmentId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar ambiente', error);
      });
  }
}
