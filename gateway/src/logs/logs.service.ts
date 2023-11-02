import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { LogsRoutes } from './logs.routes';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class LogsService {
  constructor(
    private httpService: HttpService,
    private logsRoutes: LogsRoutes,
  ) {}

  async getAuditLogs(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.logsRoutes.getAuditLogsUrl(), body).pipe(
        catchError((error) => {
          throw new HttpException(
            error.response.data.message,
            error.response.status,
          );
        })
      )
    );

    return data;
  }

  async getAccessLogs(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.logsRoutes.getAccessLogsUrl(), body).pipe(
        catchError((error) => {
          throw new HttpException(
            error.response.data.message,
            error.response.status,
          );
        })
      )
    );

    return data;
  }
}
