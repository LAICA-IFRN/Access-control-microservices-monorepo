import { Body, Controller, Post } from '@nestjs/common';
import { AccessService } from './access.service';
import { AccessByMicrocontrollerDeviceDto } from './dto/access-by-microcontroller-device.dto';
import { AccessByMobileDeviceDto } from './dto/access-by-mobile-device.dto';

@Controller('access')
export class AppController {
  constructor(private readonly accessService: AccessService) { }

  @Post('esp')
  accessByMicrocontrollerDevice(@Body() accessDto: AccessByMicrocontrollerDeviceDto) {
    return this.accessService.accessByMicrocontrollerDeviceTEMP(accessDto);
  }

  @Post('mobile')
  accessByMobileDevice(@Body() accessDto: AccessByMobileDeviceDto) {
    return this.accessService.accessByMobileDeviceTEMP(accessDto);
  }
}
