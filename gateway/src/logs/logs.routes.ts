export class LogsRoutes {
  private readonly auditLogsUrl = process.env.AUDIT_SERVICE_URL + '/search';

  getAuditLogsUrl(): string {
    return this.auditLogsUrl;
  }

  getAccessLogsUrl(): string {
    return this.auditLogsUrl;
  }
}