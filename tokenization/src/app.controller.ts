import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TokenizeDto } from './dto/tokenize.dto';
import { AuthorizationDto } from './dto/authorization.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  tokenize(@Body() tokenizeDto: TokenizeDto) {
    return this.appService.tokenize(tokenizeDto);
  }

  @Get()
  authorize(@Body() authorizationDto: AuthorizationDto) {
    return this.appService.authorize(authorizationDto)
  }
}
