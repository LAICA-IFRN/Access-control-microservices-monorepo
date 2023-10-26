import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthorizationTypeConstants, RolesConstants } from 'src/utils/constants';
import { AuthorizationType } from 'src/decorators/authorization-type.decorator';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Post('rfid')
  createRfid(@Body() createRfidDto: any) {
    return this.devicesService.createRfid(createRfidDto);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Get('rfid/:id')
  findOneRfid(@Param('id') id: string) {
    return this.devicesService.findOneRfid(id);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Get('rfid')
  findAllRfid( // TODO: testar
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return this.devicesService.findAllRfid(+skip, +take);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Patch('rfid/:id/status')
  updateRfidStatus(@Param('id') id: string, @Body() updateRfidDto: any) {
    return this.devicesService.updateRfidStatus(id, updateRfidDto);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Delete('rfid/:id')
  removeRfid(@Param('id') id: string) {
    return this.devicesService.removeRfid(id);
  }

  @Post('microcontrollers')
  createMicrocontroller(@Body() createMicrocontrollerDto: any) {
    return this.devicesService.createMicrocontroller(createMicrocontrollerDto);
  }

  @Post('microcontrollers/activate')
  activeMicrocontroller(
    @Query('id') id: number,
    @Query('environmentId') environmentId: string,
  ) {
    return this.devicesService.activeMicrocontroller(id, environmentId);
  }

  @Post('microcontrollers/keep-alive')
  keepAliveMicrocontroller(
    @Query('id') id: number,
    @Query('healthCode') healthCode: number,
    @Query('doorStatus') doorStatus: boolean,
  ) {
    return this.devicesService.keepAliveMicrocontroller(
      id,
      healthCode,
      doorStatus,
    );
  }

  @Get('microcontrollers/keep-alive')
  getMicrocontrollerInfo(@Query('id') id: number) {
    return this.devicesService.getMicrocontrollerInfo(id);
  }

  @Get('microcontrollers/:id')
  findOneMicrocontroller(@Param('id') id: number) {
    return this.devicesService.findOneMicrocontroller(id);
  }

  @Get('microcontrollers')
  findAllMicrocontroller(
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return this.devicesService.findAllMicrocontroller(+skip, +take);
  }

  @Get('microcontrollers/inactives')
  findAllMicrocontrollersInactives(
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return this.devicesService.findAllMicrocontrollersInactives(+skip, +take);
  }

  @Get('microcontrollers/environment/:environmentId')
  findAllMicrocontrollersByEnvironmentId(
    @Param('environmentId') environmentId: string,
  ) {
    return this.devicesService.findAllMicrocontrollersByEnvironmentId(
      environmentId,
    );
  }

  @Patch('microcontrollers/:id')
  updateMicrocontroller(
    @Param('id') id: number,
    @Body() updateMicrocontrollerDto: any,
  ) {
    return this.devicesService.updateMicrocontroller(id, updateMicrocontrollerDto);
  }

  @Patch('microcontrollers/:id/status')
  updateMicrocontrollerStatus(
    @Param('id') id: number,
    @Body() updateMicrocontrollerStatusDto: any,
  ) {
    return this.devicesService.updateMicrocontrollerStatus(
      id,
      updateMicrocontrollerStatusDto,
    );
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER, RolesConstants.FREQUENTER)
  @AuthorizationType(AuthorizationTypeConstants.MOBILE)
  @UseGuards(RolesGuard)
  @Post('mobile')
  createMobile(@Body() createMobileDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.devicesService.createMobile(createMobileDto, userId);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER, RolesConstants.FREQUENTER)
  @AuthorizationType(AuthorizationTypeConstants.MOBILE)
  @UseGuards(RolesGuard)
  @Get('mobile')
  getMobileEnvironments(@Query('id') id: string, @Req() request: Request) {
    const userId = request['userId'];
    return this.devicesService.getMobileEnvironments(id, userId);
  }
}
