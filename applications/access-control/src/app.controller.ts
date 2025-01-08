import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('dashboard/devices')
  async dashboardConsultDevicesData(): Promise<{ totalDevices: number; devicesCreatedAtLastWeek: number; }> {
    return await this.appService.dashboardConsultDevicesData();
  }


}
