import { Body, Controller, Post, Request, Get } from '@nestjs/common';
import { LogsService } from './logs.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('audit')
  getAuditLogs(@Body() body: any) {
    return this.logsService.getAuditLogs(body);
  }

  @Post('access')
  getAccessLogs(@Body() body: any) {
    return this.logsService.getAccessLogs(body);
  }
}
