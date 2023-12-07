import { CanActivate, ExecutionContext, HttpException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AuthorizationTypeConstants } from 'src/utils/constants';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly errorLogger = new Logger()

  constructor (
    private readonly reflector: Reflector, 
    private readonly httpService: HttpService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const authorizationType = this.reflector.get<string>('authorization-type', context.getHandler());

    if (!roles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const [prefix, value] = request.headers.authorization?.split(' ') ?? [];
    const token = prefix === 'Bearer' ? value : undefined;

    console.log(token);
    

    let response: any;
    
    if (authorizationType === AuthorizationTypeConstants.USER) {
      response = await lastValueFrom(
        this.httpService.get(process.env.VERIFY_USER_AUTHORIZATION_URL, {
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
        console.log(error);
        this.errorLogger.error('Falha ao verificar autorização', error);
  
        throw new HttpException(
          error.response.data.message,
          error.response.data.statusCode,
        );
      });
    }

    if (authorizationType === AuthorizationTypeConstants.MOBILE) {
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
        console.log(error);
        
        this.errorLogger.error('Falha ao verificar autorização', error);
  
        throw new HttpException(
          error.response.data.message,
          error.response.data.statusCode,
        );
      });
    }

    request['userId'] = response.userId

    return response.isAuthorized;
  }
}