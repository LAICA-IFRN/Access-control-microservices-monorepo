import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { CreateMobileDto } from './dto/create-mobile.dto';
import { UpdateMobileDto } from './dto/update-mobile.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post()
  create(@Body() createMobileDto: CreateMobileDto) {
    return this.mobileService.create(createMobileDto);
  }

  @Get()
  findAll() {
    return this.mobileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mobileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMobileDto: UpdateMobileDto) {
    return this.mobileService.update(+id, updateMobileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mobileService.remove(+id);
  }
}
