import { HttpService } from "@nestjs/axios";
import { Logger } from "@nestjs/common";

export type AccessByType = 'rfid' | 'pin' | 'app' | 'remote';

export interface AccessLog {
  access_by: AccessByType;
  type: 'Info' | 'Error' | 'Warn';
  message: string;
  user_id?: string;
  environment_id?: string;
  meta?: object;
}

export class AccessLogService {
  private readonly createAccessLogUrl = process.env.CREATE_ACCESS_LOG_URL
  private readonly errorLogger = new Logger()
  
  constructor (private readonly httpService: HttpService) {}

  create(log: AccessLog) {
    try {
      this.httpService.post(this.createAccessLogUrl, log);
    } catch (error) {
      this.errorLogger.error('Falha ao enviar log', error);
    }
  }
}