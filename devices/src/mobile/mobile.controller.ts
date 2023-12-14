import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { CreateMobileDto } from './dto/create-mobile.dto';
import { UpdateMobileDto } from './dto/update-mobile.dto';
import { FindAllDto } from 'src/utils/find-all.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) { }

  @Post()
  create(@Body() createMobileDto: CreateMobileDto, @Query('userId') userId: string) {
    return this.mobileService.create(userId); //createMobileDto, userId);
  }

  @Post('paginate')
  findAll(@Body() findAllDto: FindAllDto) {
    return this.mobileService.findAll(findAllDto);
  }

  @Get('has-mobile')
  hasMobile(@Query('userId') userId: string) {
    return this.mobileService.hasMobile(userId);
  }

  @Get()
  getEnvironments(@Query('id') id: number, @Query('userId') userId: string) {
    return this.mobileService.getEnvironments(+id, userId);
  }

  @Get('mac/:mac')
  getByMac(@Param('mac') mac: string) {
    return this.mobileService.getByMac(mac);
  }
}
