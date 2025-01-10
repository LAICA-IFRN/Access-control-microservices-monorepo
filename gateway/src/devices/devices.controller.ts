import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthorizationTypeConstants, RolesConstants } from 'src/utils/constants';
import { AuthorizationType } from 'src/decorators/authorization-type.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) { }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('dashboard')
  dashboardConsultData() {
    return this.devicesService.dashboardConsultData();
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('rfid')
  createRfid(@Body() createRfidDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.devicesService.createRfid({ ...createRfidDto, userId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('rfid/:id')
  findOneRfid(@Param('id') id: string) {
    return this.devicesService.findOneRfid(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('rfid/paginate')
  findAllRfid(@Body() body: any) {
    return this.devicesService.findAllRfid(body);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch('rfid/:id/status')
  updateRfidStatus(@Param('id') id: string, @Body() updateRfidDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.devicesService.updateRfidStatus(id, { ...updateRfidDto, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Delete('rfid/:id')
  removeRfid(@Param('id') id: string, @Req() request: Request) {
    const userId = request['userId'];
    return this.devicesService.removeRfid(id, userId);
  }

  @Post('microcontrollers')
  createMicrocontroller(@Body() createMicrocontrollerDto: any) {
    return this.devicesService.createMicrocontroller(createMicrocontrollerDto);
  }

  @Post('microcontrollers/cold-start')
  coldStartMicrocontroller(@Body() body: any) {
    return this.devicesService.coldStartMicrocontroller(body.id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('microcontrollers/activate')
  activeMicrocontroller(
    @Query('id') id: number,
    @Query('environmentId') environmentId: string,
    @Req() request: Request
  ) {
    const userId = request['userId'];
    return this.devicesService.activeMicrocontroller(id, environmentId, userId);
  }

  @Post('microcontrollers/keep-alive')
  keepAliveMicrocontroller(@Body() body: any) {
    const { id, healthCode, doorStatus } = body;
    return this.devicesService.keepAliveMicrocontroller(
      parseInt(id),
      parseInt(healthCode),
      doorStatus === "true" ? true : false,
    );
  }

  @Post('microcontrollers/remote-access')
  searchRemoteAccess(@Body() body: any) {
    const id = parseInt(body.id);
    return this.devicesService.searchRemoteAccess(id);
  }

  @Get('microcontrollers/keep-alive')
  getMicrocontrollerInfo(@Query('id') id: number) {
    return this.devicesService.getMicrocontrollerInfo(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('microcontrollers/paginate')
  findAllMicrocontroller(@Body() body: any) {
    return this.devicesService.findAllMicrocontroller(body);
  }

  @Get('microcontrollers/:id')
  findOneMicrocontroller(@Param('id') id: number) {
    return this.devicesService.findOneMicrocontroller(id);
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

  // @Patch('microcontrollers/:id')
  // updateMicrocontroller(
  //   @Param('id') id: number,
  //   @Body() updateMicrocontrollerDto: any,
  // ) {
  //   return this.devicesService.updateMicrocontroller(id, updateMicrocontrollerDto);
  // }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch('microcontrollers/:id/status')
  updateMicrocontrollerStatus(
    @Param('id') id: number,
    @Body() updateMicrocontrollerStatusDto: any,
    @Req() request: Request
  ) {
    const userId = request['userId'];
    return this.devicesService.updateMicrocontrollerStatus(
      id,
      { ...updateMicrocontrollerStatusDto, requestUserId: userId },
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

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('mobile/paginate')
  findAllMobile(@Body() body: any) {
    return this.devicesService.findAllMobile(body);
  }
}
