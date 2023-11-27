import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AccessService } from './access.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationType } from 'src/decorators/authorization-type.decorator';
import { AuthorizationTypeConstants, RolesConstants } from 'src/utils/constants';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post('esp')
  accessByEsp(@Body() body: any) {
    return this.accessService.accessByEsp(body);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER, RolesConstants.FREQUENTER)
  @AuthorizationType(AuthorizationTypeConstants.MOBILE)
  @UseGuards(RolesGuard)
  @Post('mobile')
  accessByMobile(@Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.accessService.accessByMobile({ ...body, userId });
  }
}
