import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { RolesConstants } from 'src/utils/roles-constants';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Post('rfid')
  createRfid(@Body() createRfidDto: any) {
    return this.devicesService.createRfid(createRfidDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('rfid/:id')
  findOneRfid(@Param('id') id: string) {
    return this.devicesService.findOneRfid(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('rfid')
  findAllRfid( // TODO: testar
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return this.devicesService.findAllRfid(+skip, +take);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Patch('rfid/:id/status')
  updateRfidStatus(@Param('id') id: string, @Body() updateRfidDto: any) {
    return this.devicesService.updateRfidStatus(id, updateRfidDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Delete('rfid/:id')
  removeRfid(@Param('id') id: string) {
    return this.devicesService.removeRfid(id);
  }
}
