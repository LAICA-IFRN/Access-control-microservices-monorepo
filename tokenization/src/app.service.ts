import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { catchError, lastValueFrom } from 'rxjs';
import { TokenizeUserDto } from './dto/tokenize-user.dto';
import { TokenizeMobileDto } from './dto/tokenize-mobile.dto';
import { AuthorizationUserDto } from './dto/authorization-user.dto';
import { AuthorizationMobileDto } from './dto/authorization-mobile.dto';
import { TokenizeAccessDto } from './dto/tokenize-access.dto';

@Injectable()
export class AppService {
  private readonly jwtUserSecret = process.env.JWT_USER_SECRET
  private readonly jwtMobileSecret = process.env.JWT_MOBILE_SECRET
  private readonly jwtUserExpirationTime = process.env.JWT_USER_EXPIRATION_TIME
  private readonly jwtMobileExpirationTime = process.env.JWT_MOBILE_EXPIRATION_TIME
  private readonly jwtAccessSecret = process.env.JWT_ACCESS_SECRET
  private readonly createAuditLogUrl = process.env.CREATE_AUDIT_LOG_URL
  private readonly validateUserUrl = process.env.VALIDATE_USER_URL
  private readonly verifyAuthorizationUrl = process.env.VERIFY_AUTHORIZATION_URL
  private readonly getMicrocontrollerUrl = process.env.GET_MICROCONTROLLER_URL
  private readonly environmentServiceUrl = process.env.ENVIRONMENTS_SERVICE_URL
  private readonly devicesServiceUrl = process.env.DEVICES_SERVICE_URL
  private readonly errorLogger = new Logger()

  constructor(
    private readonly httpService: HttpService,
  ) { }

  async tokenizeUser(tokenizeUserDto: TokenizeUserDto) {
    const data = await lastValueFrom(
      this.httpService.get(
        this.validateUserUrl,
        {
          data: tokenizeUserDto,
        },
      ).pipe(
        catchError((error) => { // TODO: criar funções de log para cada tipo de erro
          if (error.code === 'ECONNREFUSED') {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário, serviço de usuários indisponível',
                meta: {
                  document: tokenizeUserDto.document,
                }
              })
            )
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Users service unavailable', HttpStatus.SERVICE_UNAVAILABLE)
          }

          if (error.response?.status === 404) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário, usuário não encontrado',
                meta: {
                  document: tokenizeUserDto.document,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
          } else if (error.response?.status === 401) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário, senha incorreta',
                meta: {
                  document: tokenizeUserDto.document,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED)
          } else {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário, erro inesperado verifique os logs de erro no serviço',
                meta: {
                  document: tokenizeUserDto.document,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
          }
        }
        ))
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao validar usuário', error)

        throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
      })

    const token = jwt.sign(
      { sub: data.userId },
      this.jwtUserSecret,
      { expiresIn: this.jwtUserExpirationTime }
    )

    this.createLogWhenUserAuthenticates(data.userId, tokenizeUserDto.document);

    return {
      accessToken: token
    }
  }

  async createLogWhenUserAuthenticates(userId: string, document: string) {
    const user = await this.getUserData(userId);

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: 'Autenticação',
        type: 'Info',
        message: `Usuário validado, ${user.name} autenticou-se pela aplicação web`,
        meta: {
          document: document,
          // TODO: adicionar IP do usuário e informações do navegador
        }
      })
    ).catch((error) => {
      this.errorLogger.error('Falha ao enviar log', error)
    })
  }

  async tokenizeMobile(tokenizeMobileDto: TokenizeMobileDto) {
    const data = await lastValueFrom(
      this.httpService.get(
        this.validateUserUrl,
        {
          data: {
            document: tokenizeMobileDto.document,
            password: tokenizeMobileDto.password,
          },
        },
      ).pipe(
        catchError((error) => {
          if (error.code === 'ECONNREFUSED') {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário, serviço de usuários indisponível',
                meta: {
                  document: tokenizeMobileDto.document,
                }
              })
            )
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Users service unavailable', HttpStatus.SERVICE_UNAVAILABLE)
          }

          if (error.response?.status === 404) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário, registro não encontrado',
                meta: {
                  document: tokenizeMobileDto.document,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
          } else if (error.response?.status === 401) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário, senha incorreta',
                meta: {
                  document: tokenizeMobileDto.document,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED)
          } else {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autenticação',
                type: 'Error',
                message: 'Falha ao validar usuário: erro interno, verificar logs de erro do serviço',
                meta: {
                  document: tokenizeMobileDto.document,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
          }
        }
        ))
    )
      .then((response) => response.data)
      .catch((error) => {
        if (error.status === 503) {
          lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Autenticação',
              type: 'Error',
              message: 'Falha ao validar usuário, serviço de usuários indisponível',
              meta: {
                document: tokenizeMobileDto.document,
              }
            })
          )
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error)
            })

          throw new HttpException('Users service unavailable', HttpStatus.SERVICE_UNAVAILABLE)
        } else if (error.status === 404) {
          lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Autenticação',
              type: 'Error',
              message: 'Falha ao validar usuário, usuário não encontrado',
              meta: {
                document: tokenizeMobileDto.document,
              }
            })
          )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error)
            })

          throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        } else if (error.status === 401) {
          lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Autenticação',
              type: 'Error',
              message: 'Falha ao validar usuário, senha incorreta',
              meta: {
                document: tokenizeMobileDto.document,
              }
            })
          )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error)
            })

          throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED)
        } else {
          lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: 'Autenticação',
              type: 'Error',
              message: 'Falha ao validar usuário, erro inesperado verifique os logs de erro no serviço',
              meta: {
                document: tokenizeMobileDto.document,
              }
            })
          )
            .then((response) => response.data)
            .catch((error) => {
              this.errorLogger.error('Falha ao enviar log', error)
            })

          throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
      })

    const token = jwt.sign(
      { sub: data.userId },
      this.jwtMobileSecret,
      { expiresIn: this.jwtMobileExpirationTime }
    )

    let mobileId;

    if (tokenizeMobileDto.mobileId) {
      const mobileData = await this.findMobileById(tokenizeMobileDto.mobileId);

      if (mobileData) {
        this.createLogWhenMobileAuthenticates(data.userId, tokenizeMobileDto.mobileId);
        mobileId = tokenizeMobileDto.mobileId;
      }
    } else {
      const userMobile = await this.createUserMobile(data.userId);

      if (userMobile) {
        this.createLogWhenMobileAuthenticates(data.userId, userMobile.id);
        mobileId = userMobile.id;
      }
    }

    return {
      accessToken: token,
      mobileId: mobileId,
    };
  }

  private async createUserMobile(userId: string) {
    const userMobile = await lastValueFrom(
      this.httpService.post(`${this.devicesServiceUrl}/mobile?userId=${userId}`, {
        userId: userId,
      })
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao criar aparelho', error)
        throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
      })

    return userMobile;
  }

  private async findMobileById(mobileId: string) {
    const mobile = await lastValueFrom(
      this.httpService.get(`${this.devicesServiceUrl}/mobile/${mobileId}`)
    )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao buscar aparelho', error)
        throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
      })

    return mobile;
  }

  async createLogWhenMobileAuthenticates(userId: string, mobileId: string) {
    const user = await this.getUserData(userId);

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: 'Autenticação',
        type: 'Info',
        message: `Usuário validado, ${user.name} autenticou-se pelo dispositivo móvel`,
        meta: {
          userId: userId,
          mobileId: mobileId,
        }
      })
    ).catch((error) => {
      this.errorLogger.error('Falha ao enviar log', error)
    })
  }

  // async tokenizeAccess(tokenizeAccessDto: TokenizeAccessDto) {
  //   const microcontroller = await lastValueFrom(
  //     this.httpService.get(`${this.getMicrocontrollerUrl}/one/${tokenizeAccessDto.microcontrollerId}`)
  //   )
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       this.errorLogger.error('Falha ao obter dados do ambiente', error)

  //       throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
  //     })

  //   const qrcode = await lastValueFrom(
  //     this.httpService.get(`${this.environmentServiceUrl}/env/${microcontroller.environment_id}/qr-code`)
  //   )
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       this.errorLogger.error('Falha ao obter dados do ambiente', error)

  //       throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
  //     })

  //   if (tokenizeAccessDto.qrcode !== qrcode) {
  //     throw new HttpException('Invalid QR Code', HttpStatus.BAD_REQUEST)
  //   }

  //   const userRoles = await this.getUserRoles(tokenizeAccessDto.userId);

  //   if (userRoles.includes('FREQUENTER')) {
  //     return this.handleFrequenterTokenizationAccess(microcontroller.environment_id, tokenizeAccessDto.userId);
  //   }

  //   if (userRoles.includes('ENVIRONMENT_MANAGER')) {
  //     return this.handleManagerTokenizationAccess(microcontroller.environment_id, tokenizeAccessDto.userId);
  //   }

  //   return this.handleAdminTokenizationAccess(microcontroller.environment_id, tokenizeAccessDto.userId);
  // }

  // private async handleAdminTokenizationAccess(environmentId: string, userId: string) {
  //   const environmentData: any = await lastValueFrom(
  //     this.httpService.get(`${this.environmentServiceUrl}/env/${environmentId}`)
  //   )
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       this.errorLogger.error('Falha ao obter dados do ambiente', error)
  //       throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
  //     })

  //   const now = new Date();

  //   const endOfTheDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  //   const difference = endOfTheDay.getTime() - now.getTime();
  //   const seconds = Math.floor(difference / 1000);

  //   const token = jwt.sign(
  //     { sub: { id: userId, role: 'ADMIN', env: environmentId } },
  //     this.jwtAccessSecret,
  //     { expiresIn: seconds }
  //   )

  //   return {
  //     token: token,
  //     latitude: environmentData.latitude,
  //     longitude: environmentData.longitude,
  //     name: environmentData.name,
  //   }
  // }

  // private async handleManagerTokenizationAccess(environmentId: string, userId: string) {
  //   const searchEnvironmentUserData = `${this.environmentServiceUrl}/env-manager/environment/${environmentId}/user/${userId}`;
  //   const environmentUserData = await lastValueFrom(
  //     this.httpService.get(searchEnvironmentUserData)
  //   )
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       this.errorLogger.error('Falha ao obter dados do ambiente', error)

  //       throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
  //     })

  //   if (!environmentUserData) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND)
  //   }

  //   const now = new Date();
  //   const endOfTheDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  //   const difference = endOfTheDay.getTime() - now.getTime();
  //   const seconds = Math.floor(difference / 1000);

  //   const token = jwt.sign(
  //     { sub: { id: environmentUserData.environmentUserId, role: 'ENVIRONMENT_MANAGER' } },
  //     this.jwtAccessSecret,
  //     { expiresIn: seconds }
  //   )

  //   return {
  //     token: token,
  //     latitude: environmentUserData.latitude,
  //     longitude: environmentUserData.longitude,
  //     name: environmentUserData.name,
  //   }
  // }

  // private async handleFrequenterTokenizationAccess(environmentId: string, userId: string) {
  //   const searchEnvironmentUserData = `${this.environmentServiceUrl}/env-access/environment/${environmentId}/user/${userId}`;
  //   const environmentUserData = await lastValueFrom(
  //     this.httpService.get(searchEnvironmentUserData)
  //   )
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       this.errorLogger.error('Falha ao obter dados do ambiente', error)

  //       throw new HttpException(error.response.data.message, error.response.data.statusCode);
  //     })

  //   if (!environmentUserData) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND)
  //   }

  //   const now = new Date();

  //   if (!environmentUserData.days.includes(now.getDay())) {
  //     throw new HttpException('User not allowed today', HttpStatus.UNAUTHORIZED)
  //   }

  //   const endOfTheDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  //   const difference = endOfTheDay.getTime() - now.getTime();
  //   const seconds = Math.floor(difference / 1000);

  //   const token = jwt.sign(
  //     { sub: { id: environmentUserData.environmentUserId, role: 'FREQUENTER' } },
  //     this.jwtAccessSecret,
  //     { expiresIn: seconds }
  //   )

  //   return {
  //     token: token,
  //     latitude: environmentUserData.latitude,
  //     longitude: environmentUserData.longitude,
  //     name: environmentUserData.name,
  //   }
  // }

  // async authorizeAccess(token: string) {
  //   try {
  //     const decodedToken = jwt.verify(token, this.jwtAccessSecret)
  //     return decodedToken.sub
  //   } catch (error) {
  //     throw new HttpException('Expired or invalid token', HttpStatus.UNAUTHORIZED)
  //   }
  // }

  // private async getUserRoles(userId: string) {
  //   const getUserRolesUrl = `${process.env.USERS_SERVICE_URL}/roles/${userId}/all`;
  //   const data = await lastValueFrom(
  //     this.httpService.get(getUserRolesUrl).pipe(
  //       catchError((error) => {
  //         this.errorLogger.error('Falha ao buscar papéis do usuário', error);
  //         throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //       })
  //     )
  //   ).then((response) => response.data)

  //   return data.roles;
  // }

  async getUserData(userId: string) {
    const getUserDataUrl = `${process.env.USERS_SERVICE_URL}/${userId}`;
    const data = await lastValueFrom(
      this.httpService.get(getUserDataUrl).pipe(
        catchError((error) => {
          this.errorLogger.error('Falha ao buscar dados do usuário', error);
          throw new HttpException(error.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
        })
      )
    ).then((response) => response.data)

    return data;
  }

  async authorizeUser(authorizationUserDto: AuthorizationUserDto) {
    let decodedToken;

    try {
      decodedToken = jwt.verify(authorizationUserDto.token, this.jwtUserSecret)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
    }

    const isAuthorized = await lastValueFrom(
      this.httpService.get(
        this.verifyAuthorizationUrl,
        {
          data: {
            userId: decodedToken.sub,
            roles: authorizationUserDto.roles,
          },
        },
      ).pipe(
        catchError((error) => {
          if (error.code === 'ECONNREFUSED') {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autorização',
                type: 'Error',
                message: 'Falha ao autorizar usuário, serviço de usuários indisponível',
                meta: {
                  userId: decodedToken.sub,
                  roles: authorizationUserDto.roles,
                }
              })
            )
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Users service unavailable', HttpStatus.SERVICE_UNAVAILABLE)
          } else if (error.response?.status === 404) {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autorização',
                type: 'Error',
                message: 'Falha ao autorizar usuário, registro não encontrado',
                meta: {
                  userId: decodedToken.sub,
                  roles: authorizationUserDto.roles,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
          } else {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autorização',
                type: 'Error',
                message: 'Falha ao autorizar usuário, erro inesperado verifique os logs de erro no serviço',
                meta: {
                  userId: decodedToken.sub,
                  roles: authorizationUserDto.roles,
                }
              })
            )
              .then((response) => response.data)
              .catch((error) => {
                this.errorLogger.error('Falha ao enviar log', error)
              })

            throw new HttpException('Unknown error', HttpStatus.INTERNAL_SERVER_ERROR)
          }
        })
      )
    )
      .then((response) => response.data)

    if (!isAuthorized) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }

    return { isAuthorized, userId: decodedToken.sub }
  }

  async authorizeMobile(authorizationMobileDto: AuthorizationMobileDto) {
    try {
      const decodeToken = jwt.verify(authorizationMobileDto.token, this.jwtMobileSecret);
      return { isAuthorized: true, userId: decodeToken.sub }
    } catch (error) {
      throw new HttpException('Expired or invalid token', HttpStatus.UNAUTHORIZED)
    }
  }

  async verifyMobileToken(token: string) {
    try {
      jwt.verify(token, this.jwtMobileSecret);
      return { isValid: true }
    } catch (error) {
      this.errorLogger.error('Falha ao validar token', error)
      return { isValid: false }
    }
  }

  async verifyUserToken(token: string) {
    try {
      jwt.verify(token, this.jwtUserSecret);
      return { isValid: true }
    } catch (error) {
      this.errorLogger.error('Falha ao validar token', error)
      return { isValid: false }
    }
  }

  // async verifyAccessToken(token: string) {
  //   try {
  //     jwt.verify(token, this.jwtAccessSecret);
  //     return { isValid: true }
  //   } catch (error) {
  //     this.errorLogger.error('Falha ao validar token', error)
  //     return { isValid: false }
  //   }
  // }
}