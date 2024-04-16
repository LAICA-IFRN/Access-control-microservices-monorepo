import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationTypeConstants, RolesConstants } from 'src/utils/constants';
import { AuthorizationType } from 'src/decorators/authorization-type.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Environments')
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) { }

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @Post()
  create(@Body() createEnvironmentDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.create({ 
      ...createEnvironmentDto, 
      requestUserId: userId
    });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('temporary-access')
  createTemporaryAccess(@Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.createTemporaryAccess({
      ...body, 
      requestUserId: userId
    });
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('remote-access')
  requestRemoteAccess(@Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    const { environmentId, esp8266Id, type } = body;
    return this.environmentsService.requestRemoteAccess(environmentId, parseInt(esp8266Id), type, userId);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('dashboard')
  dashboardConsultData() {
    return this.environmentsService.dashboardConsultData();
  }

  // @AuthorizationType(AuthorizationTypeConstants.MICROCONTROLLER) // TODO: autenticar microcontrolador
  // @UseGuards(RolesGuard)
  @Get('remote-access')
  findRemoteAccess(@Query('esp8266Id') esp8266Id: number) {
    return this.environmentsService.findRemoteAccess(esp8266Id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('paginate')
  findAll(@Body() body: any) {
    return this.environmentsService.findAll(body);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.ANY)
  @UseGuards(RolesGuard)
  @Get('environment/:id')
  findOne(@Param('id') id: string) {
    return this.environmentsService.findOne(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch('environment/:id')
  update(@Param('id') id: string, @Body() updateEnvironmentDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.update(id, { ...updateEnvironmentDto, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch('environment/:id/status')
  updateStatus(@Param('id') id: string, @Body() updateEnvironmentDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.updateStatus(id, { ...updateEnvironmentDto, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Delete('environment/:id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.remove(id, userId);
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('manager')
  createManager(@Body() createManagerDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.createManager({ ...createManagerDto, requestUserId: userId });
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  // @Get('manager')
  // findAllManagers() {
  //   return this.environmentsService.findAllManagers();
  // }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  // @Get('manager/:id')
  // findOneManager(@Param('id') id: string) {
  //   return this.environmentsService.findOneManager(id);
  // }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('manager')
  findAllManagerByUserId(@Query('userId') id: string) {
    return this.environmentsService.findAllManagerByUserId(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('environment/:id/manager')
  findAllManagerByEnvironmentId(@Param('id') id: string) {
    return this.environmentsService.findAllManagerByEnvironmentId(id);
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('environment/:envId/manager/user/:userId/verify')
  searchAccessByUserAndEnv(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.environmentsService.searchAccessByUserAndEnv(userId, envId);
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch('manager/:id/status')
  updateManagerStatus(@Param('id') id: string, @Body() updateManagerDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.updateManagerStatus(id, { ...updateManagerDto, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('frequenter')
  createAccess(@Body() createAccessDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.createAccess({ ...createAccessDto, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('frequenter/parity')
  findAccessParity(@Body() createAccessDto: any) {
    return this.environmentsService.findAccessParity(createAccessDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('frequenter')
  findAllAccess() {
    return this.environmentsService.findAllAccess();
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('frequenter/user/:id')
  findAllByFrequenter(@Param('id') id: string) {
    return this.environmentsService.findAllByFrequenter(id);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  // @Get('frequenter/inactive')
  // findAllInactives() {
  //   return this.environmentsService.findAllInactives();
  // }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('frequenter/:id')
  findOneAccess(@Param('id') id: string) {
    return this.environmentsService.findOneAccess(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('environment/:id/frequenter')
  findAllAccessByEnvironmentId(@Param('id') id: string) {
    return this.environmentsService.findAllAccessByEnvironmentId(id);
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('environment/:envId/frequenter/user/:userId/verify')
  searchManagerByUserAndEnv(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.environmentsService.searchManagerByUserAndEnv(userId, envId);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch('frequenter/:id/status')
  updateAccessStatus(@Param('id') id: string, @Body() updateAccessDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.updateAccessStatus(id, { ...updateAccessDto, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch('frequenter/:id')
  updateAccess(@Param('id') id: string, @Body() updateAccessDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.updateAccess(id, { ...updateAccessDto, requestUserId: userId });
  }
}
