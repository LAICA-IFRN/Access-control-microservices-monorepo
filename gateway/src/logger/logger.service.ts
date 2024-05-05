import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { LoggerRoutes } from './logger.routes';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class LoggerService {
  constructor(
    private httpService: HttpService,
    private loggerRoutes: LoggerRoutes,
  ) { }
}
