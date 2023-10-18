import { Body, Controller, Post } from '@nestjs/common';
import { AccessService } from './access.service';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post()
  access(@Body() body: any) {
    return this.accessService.access(body);
  }
}
