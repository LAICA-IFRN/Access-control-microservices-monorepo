import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessByMicrocontrollerDeviceDto } from './dto/access-by-microcontroller-device.dto';
import { AccessByMobileDeviceDto } from './dto/access-by-mobile-device.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('esp')
  accessByMicrocontrollerDevice(@Body() accessDto: AccessByMicrocontrollerDeviceDto) {
    return this.appService.accessByMicrocontrollerDeviceTEMP(accessDto);
  }

  @Post('mobile')
  accessByMobileDevice(@Body() accessDto: AccessByMobileDeviceDto) {
    return this.appService.accessByMobileDeviceTEMP(accessDto);
  }
}
