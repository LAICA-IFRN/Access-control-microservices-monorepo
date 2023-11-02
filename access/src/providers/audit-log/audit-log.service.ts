import { HttpService } from "@nestjs/axios";
import { Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";


export interface AccessLog {
  type: 'info' | 'error' | 'warn';
  message: string;
  meta?: object;
}

export class AccessLogService {
  private readonly createAccessLogUrl = process.env.CREATE_ACCESS_LOG_URL
  private readonly errorLogger = new Logger()
  private readonly httpService: HttpService = new HttpService()
  
  constructor () {}

  async create(log: AccessLog) {
    try {
      await lastValueFrom(this.httpService.post(this.createAccessLogUrl, log));
    } catch (error) {
      this.errorLogger.error('Falha ao enviar log', error);
    }
  }
}