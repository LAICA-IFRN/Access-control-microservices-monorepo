import { HttpService } from "@nestjs/axios";
import { Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

export interface AuditLog {
  topic: 'Usuários';
  type: 'Info' | 'Error' | 'Warn';
  message: string;
  meta: object;
}

export class AuditLogService {
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly errorLogger = new Logger()
  
  constructor (private readonly httpService: HttpService) {}

  create(log: AuditLog) {
    try {
      this.httpService.post(this.createAuditLogUrl, log);
    } catch (error) {
      this.errorLogger.error('Falha ao enviar log', error);
    }
  }
}