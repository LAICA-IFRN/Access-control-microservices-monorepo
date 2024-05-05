export class LoggerRoutes {
  private readonly loggerServiceUrl = process.env.LOGGER_SERVICE_URL;

  createConfigLog(): string {
    return `${this.loggerServiceUrl}/config`;
  }
}