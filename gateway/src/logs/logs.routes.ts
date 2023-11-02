export class LogsRoutes {
  private readonly auditLogsUrl = process.env.AUDIT_SERVICE_URL + '/logs/search';
  private readonly accessLogsUrl = process.env.AUDIT_SERVICE_URL + '/access/search';

  getAuditLogsUrl(): string {
    return this.auditLogsUrl;
  }

  getAccessLogsUrl(): string {
    return this.accessLogsUrl;
  }
}