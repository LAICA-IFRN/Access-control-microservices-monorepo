import { Body, Controller, Post } from '@nestjs/common';
import { AccessService } from './access.service';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post('esp')
  accessByEsp(@Body() body: any) {
    return this.accessService.accessByEsp(body);
  }

  @Post('mobile')
  accessByMobile(@Body() body: any) {
    return this.accessService.accessByMobile(body);
  }
}
