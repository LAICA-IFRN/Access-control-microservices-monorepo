import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RfidService } from './rfid.service';
import { CreateRfidDto } from './dto/create-rfid.dto';
import { UpdateStatusRfidDto } from './dto/update-status-rfid.dto';

@Controller('rfid')
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @Post()
  create(@Body() createRfidDto: CreateRfidDto) {
    return this.rfidService.create(createRfidDto);
  }

  @Get()
  findAll(
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return this.rfidService.findAll(+skip, +take);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rfidService.findOne(+id);
  }

  @Patch('status')
  updateStatus(@Body() updateStatusRfidDto: UpdateStatusRfidDto) {
    return this.rfidService.updateStatus(updateStatusRfidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.rfidService.remove(+id);
  }
}
