import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RfidService } from './rfid.service';
import { CreateRfidDto } from './dto/create-rfid.dto';
import { UpdateStatusRfidDto } from './dto/update-status-rfid.dto';
import { FindAllDto } from 'src/utils/find-all.dto';

@Controller('rfid')
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @Post()
  create(@Body() createRfidDto: CreateRfidDto) {
    return this.rfidService.create(createRfidDto);
  }

  @Post('paginate')
  findAll(@Body() findAllDto: FindAllDto) {
    return this.rfidService.findAll(findAllDto);
  }

  @Get('tag')
  findOneByTag(@Query('tag') tag: string) {
    return this.rfidService.findOneByTag(tag);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    console.log('findOne');
    return this.rfidService.findOne(+id);
  }

  @Patch('status')
  updateStatus(@Body() updateStatusRfidDto: UpdateStatusRfidDto) {
    return this.rfidService.updateStatus(updateStatusRfidDto);
  }

  @Delete(':id/action-by/:userId')
  remove(@Param('id') id: number, @Param('userId') userId: string) {
    return this.rfidService.remove(+id, userId);
  }
}
