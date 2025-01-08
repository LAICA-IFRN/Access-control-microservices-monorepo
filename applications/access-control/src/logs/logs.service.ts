import { HttpService } from "@nestjs/axios";
import { Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

export interface LogsCerberus {
  topic: string;
  type: 'Info' | 'Error' | 'Warn';
  message: string;
  meta: object;
}

export class LogsCerberusService {
  private readonly createAuditLogUrl = process.env.LOGS_SERVICE_URL
  private readonly errorLogger = new Logger()
  private readonly httpService: HttpService = new HttpService()

  constructor() { }

  async create(log: LogsCerberus) {
    try {
      await lastValueFrom(this.httpService.post(this.createAuditLogUrl, log))
    } catch (error) {
      this.errorLogger.error('Falha ao enviar log', error);
    }
  }
}