import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessDto } from './dto/access.dto';

@Controller('access')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  access(@Body() accessDto: AccessDto) {
    return this.appService.access(accessDto);
  }
}
