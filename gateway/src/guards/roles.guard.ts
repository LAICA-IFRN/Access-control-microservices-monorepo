import { CanActivate, ExecutionContext, HttpException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly errorLogger = new Logger()

  constructor (
    private readonly reflector: Reflector, 
    private readonly httpService: HttpService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    
    const verifyAuthorizationUrl = process.env.TOKENIZATION_SERVICE_URL + '/authorize';
    const response = await lastValueFrom(
      this.httpService.get(verifyAuthorizationUrl, {
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
    .then((response) => response.data.isAuthorized)
    .catch((error) => {
      this.errorLogger.error('Falha ao verificar autorização', error);

      throw new HttpException(
        error.response.data.message,
        error.response.data.statusCode,
      );
    });

    return response;
  }
}