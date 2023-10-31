import { HttpService } from "@nestjs/axios";
import { Logger } from "@nestjs/common";
import { AccessByType } from "../constants";


export interface AccessLog {
  type: 'Info' | 'Error' | 'Warn';
  message: string;
  meta?: object;
}

export class AccessLogService {
  private readonly createAccessLogUrl = process.env.CREATE_ACCESS_LOG_URL
  private readonly errorLogger = new Logger()
  
  constructor (private readonly httpService: HttpService) {}

  async create(log: AccessLog) {
    try {
      this.httpService.post(this.createAccessLogUrl, log);
    } catch (error) {
      this.errorLogger.error('Falha ao enviar log', error);
    }
  }
}