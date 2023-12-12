import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('dashboard')
  async dashboardConsultData(): Promise<{ totalDevices: number; devicesCreatedAtLastWeek: number; }> {
    return await this.appService.dashboardConsultData();
  }
}
