import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('tokenize')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
