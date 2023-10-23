import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginMobileDto } from './dto/login-mobile.dto';

@Controller('tokenize')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('user')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Post('mobile')
  loginMobile(@Body() loginMobileDto: LoginMobileDto) {
    return this.authService.loginMobile(loginMobileDto);
  }
}
