export class LogsRoutes {
  private readonly auditLogsUrl = process.env.AUDIT_SERVICE_URL + '/logs';
  private readonly accessLogsUrl = process.env.ACCESS_SERVICE_URL + '/access';

  getAuditLogsUrl(): string {
    return this.auditLogsUrl;
  }

  getAccessLogsUrl(): string {
    return this.accessLogsUrl;
  }
}