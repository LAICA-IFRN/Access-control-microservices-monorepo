import { CanActivate, ExecutionContext, HttpException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AuthorizationTypeConstants } from 'src/utils/constants';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly errorLogger = new Logger()
  private readonly verifyUserAuthorizationUrl = process.env.VERIFY_USER_AUTHORIZATION_URL;

  constructor (
    private readonly reflector: Reflector, 
    private readonly httpService: HttpService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const authorizationType = this.reflector.get<string>('authorization-type', context.getHandler());

    if (!roles && authorizationType === AuthorizationTypeConstants.MICROCONTROLLER) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const [prefix, value] = request.headers.authorization?.split(' ') ?? [];
    const token = prefix === 'Bearer' ? value : undefined;

    let response: any;
    
    if (
      authorizationType === AuthorizationTypeConstants.WEB ||
      authorizationType === AuthorizationTypeConstants.ANY
    ) {
      response = await lastValueFrom(
        this.httpService.get(this.verifyUserAuthorizationUrl, {
          data: {
            token,
            roles
          }
        }).pipe(
          catchError((error) => {
            throw new HttpException(
              error.response,
              error.status,
            );
          })
        )
      )
      .then((response) => response.data)
      .catch((error) => {
        this.errorLogger.error('Falha ao verificar autorização', error);
  
        throw new HttpException(
          error.response.data.message,
          error.response.data.statusCode,
        );
      });
    }
    
    if (
      authorizationType === AuthorizationTypeConstants.MOBILE ||
      authorizationType === AuthorizationTypeConstants.ANY
    ) {
      response = await lastValueFrom(
        this.httpService.get(process.env.VERIFY_MOBILE_AUTHORIZATION_URL, {
          data: {
            token
          }
        }).pipe(
          catchError((error) => {
            throw new HttpException(
              error.response,
              error.status,
            );
          })
        )
      )
      .then((response) => response.data)
      .catch((error) => {        
        this.errorLogger.error('Falha ao verificar autorização', error);
  
        throw new HttpException(
          error.response.data.message,
          error.response.data.statusCode,
        );
      });
    }

    if (authorizationType === AuthorizationTypeConstants.MICROCONTROLLER) {
      // TODO: Implementar verificação de autorização para microcontroladores
    }

    if (response.userId) {
      request['userId'] = response.userId
    }

    if (response.mac) {
      request['mac'] = response.mac;
    }

    return response.isAuthorized;
  }
}