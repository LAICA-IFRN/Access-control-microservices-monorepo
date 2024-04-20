import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginWebDto } from './dto/login-web.dto';
import { LoginMobileDto } from './dto/login-mobile.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationTypeConstants, RolesConstants } from 'src/utils/constants';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthorizationType } from 'src/decorators/authorization-type.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('tokenize')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('web')
  loginWeb(@Body() loginWebDto: LoginWebDto) {
    return this.authService.loginWeb(loginWebDto);
  }

  @Post('mobile')
  loginMobile(@Body() loginMobileDto: LoginMobileDto) {
    return this.authService.loginMobile(loginMobileDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER, RolesConstants.FREQUENTER)
  @AuthorizationType(AuthorizationTypeConstants.MOBILE)
  @UseGuards(RolesGuard)
  @Post('access')
  loginEnvironmentUser(@Body() body: any, @Req() request: Request) {
    const castBody = {
      qrcode: body.qrcode,
      microcontrollerId: parseInt(body.microcontrollerId)
    }
    const userId = request['userId'];
    return this.authService.loginEnvironmentUser(castBody, userId);

  }

  @Get('verify/user')
  verifyUserToken(@Query('token') token: string) {
    return this.authService.verifyUserToken(token)
  }

  @Get('verify/mobile')
  verifyMobileToken(@Query('token') token: string) {
    return this.authService.verifyMobileToken(token)
  }

  @Get('verify/access')
  verifyAccessToken(@Query('token') token: string) {
    return this.authService.verifyAccessToken(token)
  }
}
