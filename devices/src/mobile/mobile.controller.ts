import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { CreateMobileDto } from './dto/create-mobile.dto';
import { UpdateMobileDto } from './dto/update-mobile.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post()
  create(@Body() createMobileDto: CreateMobileDto, @Query('userId') userId: string) {
    return this.mobileService.create(createMobileDto, userId);
  }
  
  @Get('environments')
  getEnvironments(@Query('mac') mac: string, @Query('userId') userId: string) {
    return this.mobileService.getEnvironments(mac, userId);
  }
}
