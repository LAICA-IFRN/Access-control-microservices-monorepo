import { HttpService } from "@nestjs/axios";
import { Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

export interface AuditLog {
  topic: 'Ambientes';
  type: 'info' | 'error' | 'warn';
  message: string;
  meta: object;
}

export class AuditLogService {
  private readonly createAuditLogUrl = process.env.AUDIT_LOG_URL
  private readonly errorLogger = new Logger()
  
  constructor (private readonly httpService: HttpService) {}

  async create(log: AuditLog) {
    try {
      await lastValueFrom(this.httpService.post(this.createAuditLogUrl, log))
    } catch (error) {
      this.errorLogger.error('Falha ao enviar log', error);
    }
  }
}