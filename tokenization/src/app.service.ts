import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { TokenizeDto } from './dto/tokenize.dto';
import { catchError, lastValueFrom } from 'rxjs';
import { AuthorizationDto } from './dto/authorization.dto';

@Injectable()
export class AppService {
  private readonly jwtSecret = process.env.JWT_SECRET
  private readonly jwtExpirationTime = process.env.JWT_EXPIRATION_TIME
  private readonly createAuditLogUrl = process.env.CREATE_AUDIT_LOG_URL
  private readonly validateUserUrl = process.env.VALIDATE_USER_URL
  private readonly verifyAuthorizationUrl = process.env.VERIFY_AUTHORIZATION_URL
  private readonly errorLogger = new Logger()

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async tokenize(tokenizeDto: TokenizeDto) {
    const data = await lastValueFrom(
      this.httpService.get(
        this.validateUserUrl,
        {
          data: tokenizeDto,
        },
      ).pipe(
        catchError((error) => {
          if (error.code === 'ECONNREFUSED') {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Tokenização',
                type: 'Error',
                message: 'Falha ao validar usuário: serviço indisponível',
                meta: {
                  document: tokenizeDto.document,
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
                topic: 'Tokenização',
                type: 'Error',
                message: 'Falha ao validar usuário: usuário não encontrado',
                meta: {
                  document: tokenizeDto.document,
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
                topic: 'Tokenização',
                type: 'Error',
                message: 'Falha ao validar usuário: senha incorreta',
                meta: {
                  document: tokenizeDto.document,
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
                topic: 'Tokenização',
                type: 'Error',
                message: 'Falha ao validar usuário: erro interno, verificar logs de erro do serviço',
                meta: {
                  document: tokenizeDto.document,
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
      this.jwtSecret, 
      { expiresIn: this.jwtExpirationTime }
    )

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: 'Tokenização',
        type: 'Info',
        message: 'Usuário validado com sucesso',
        meta: {
          document: tokenizeDto.document,
        }
      })
    ).catch((error) => {
      this.errorLogger.error('Falha ao enviar log', error)
    })

    return {
      accessToken: token
    }
  }

  async authorize(authorizationDto: AuthorizationDto) {
    const decodedToken = jwt.verify(authorizationDto.token, this.jwtSecret)

    if (!decodedToken) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED)
    }

    const isAuthorized = await lastValueFrom(
      this.httpService.get(
        this.verifyAuthorizationUrl,
        {
          data: {
            userId: decodedToken.sub,
            roles: authorizationDto.roles,
          },
        },
      ).pipe(
        catchError((error) => {
          console.log(error);
          
          if (error.code === 'ECONNREFUSED') {
            lastValueFrom(
              this.httpService.post(this.createAuditLogUrl, {
                topic: 'Autorização',
                type: 'Error',
                message: 'Falha ao autorizar usuário: serviço indisponível',
                meta: {
                  userId: decodedToken.sub,
                  roles: authorizationDto.roles,
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
                message: 'Falha ao autorizar usuário: usuário não encontrado',
                meta: {
                  userId: decodedToken.sub,
                  roles: authorizationDto.roles,
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
                message: 'Falha ao autorizar usuário: erro interno, verificar logs de erro do serviço',
                meta: {
                  userId: decodedToken.sub,
                  roles: authorizationDto.roles,
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

    return { isAuthorized }
  }
}