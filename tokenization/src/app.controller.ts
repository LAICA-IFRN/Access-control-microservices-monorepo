import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { TokenizeUserDto } from './dto/tokenize-user.dto';
import { AuthorizationUserDto } from './dto/authorization-user.dto';
import { AuthorizationMobileDto } from './dto/authorization-mobile.dto';
import { TokenizeMobileDto } from './dto/tokenize-mobile.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('tokenize/user')
  tokenizeUser(@Body() tokenizeUserDto: TokenizeUserDto) {
    return this.appService.tokenizeUser(tokenizeUserDto);
  }

  @Post('tokenize/mobile')
  tokenizeMobile(@Body() tokenizeMobileDto: TokenizeMobileDto) {
    console.log(tokenizeMobileDto);

    return this.appService.tokenizeMobile(tokenizeMobileDto);
  }

  @Get('authorize/user')
  authorizeUser(@Body() authorizationUserDto: AuthorizationUserDto) {
    return this.appService.authorizeUser(authorizationUserDto)
  }

  @Get('authorize/mobile')
  authorizeMobile(@Query() authorizationMobileDto: AuthorizationMobileDto) {
    return this.appService.authorizeMobile(authorizationMobileDto)
  }
}