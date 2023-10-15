import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('rfid')
  createRfid(@Body() createRfidDto: any) {
    return this.devicesService.createRfid(createRfidDto);
  }

  @Get('rfid/:id')
  findOneRfid(@Param('id') id: string) {
    return this.devicesService.findOneRfid(id);
  }

  @Get('rfid')
  findAllRfid( // TODO: testar
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return this.devicesService.findAllRfid(+skip, +take);
  }

  @Patch('rfid/:id/status')
  updateRfidStatus(@Param('id') id: string, @Body() updateRfidDto: any) {
    return this.devicesService.updateRfidStatus(id, updateRfidDto);
  }

  @Delete('rfid/:id')
  removeRfid(@Param('id') id: string) {
    return this.devicesService.removeRfid(id);
  }
}
