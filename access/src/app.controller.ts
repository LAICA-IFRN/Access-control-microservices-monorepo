import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessByMicrocontrollerDeviceDto } from './dto/access-by-microcontroller-device.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('esp')
  accessByMicrocontrollerDevice(@Body() accessDto: AccessByMicrocontrollerDeviceDto) {
    return this.appService.accessByMicrocontrollerDevice(accessDto);
  }
}
