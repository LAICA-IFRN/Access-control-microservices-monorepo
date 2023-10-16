import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesConstants } from 'src/utils/roles-constants';

@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @Post('env')
  create(@Body() createEnvironmentDto: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.environmentsService.create(createEnvironmentDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env')
  findAll(@Query('skip') skip: number, @Query('take') take: number) {
    return this.environmentsService.findAll(skip, take);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env/:id')
  findOne(@Param('id') id: string) {
    return this.environmentsService.findOne(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Patch('env/:id')
  update(@Param('id') id: string, @Body() updateEnvironmentDto: any) {
    return this.environmentsService.update(id, updateEnvironmentDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Patch('env/:id/status')
  updateStatus(@Param('id') id: string, @Body() updateEnvironmentDto: any) {
    return this.environmentsService.updateStatus(id, updateEnvironmentDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Delete('env/:id')
  remove(@Param('id') id: string) {
    return this.environmentsService.remove(id);
  }

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @Post('env-manager')
  createManager(@Body() createManagerDto: any) {
    return this.environmentsService.createManager(createManagerDto);
  }

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @Get('env-manager')
  findAllManagers() {
    return this.environmentsService.findAllManagers();
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env-manager/:id')
  findOneManager(@Param('id') id: string) {
    return this.environmentsService.findOneManager(id);
  }

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @Get('env-manager/user/:id')
  findAllManagerByUserId(@Param('id') id: string) {
    return this.environmentsService.findAllManagerByUserId(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env-manager/env/:id')
  findAllManagerByEnvironmentId(@Param('id') id: string) {
    return this.environmentsService.findAllManagerByEnvironmentId(id);
  }

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @Get('env-manager/user/:userId/env/:envId/verify')
  searchAccessByUserAndEnv(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.environmentsService.searchAccessByUserAndEnv(userId, envId);
  }

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @Patch('env-manager/:id/status')
  updateManagerStatus(@Param('id') id: string, @Body() updateManagerDto: any) {
    return this.environmentsService.updateManagerStatus(id, updateManagerDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Post('env-access')
  createAccess(@Body() createAccessDto: any) {
    return this.environmentsService.createAccess(createAccessDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env-access/parity')
  findAccessParity(@Body() createAccessDto: any) {
    return this.environmentsService.findAccessParity(createAccessDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env-access')
  findAllAccess() {
    return this.environmentsService.findAllAccess();
  }
  
  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env-access/frequenter/:id')
  findAllByFrequenter(@Param('id') id: string) {
    return this.environmentsService.findAllByFrequenter(id);
  }
  
  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env-access/inactive')
  findAllInactives() {
    return this.environmentsService.findAllInactives();
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get('env-access/:id')
  findOneAccess(@Param('id') id: string) {
    return this.environmentsService.findOneAccess(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Get(':id/env-access')
  findAllAccessByEnvironmentId(@Param('id') id: string) {
    return this.environmentsService.findAllAccessByEnvironmentId(id);
  }

  @Roles(RolesConstants.ADMIN)
  @UseGuards(RolesGuard)
  @Get('env-access/user/:userId/env/:envId/verify')
  searchManagerByUserAndEnv(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.environmentsService.searchManagerByUserAndEnv(userId, envId);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Patch('env-access/:id/status')
  updateAccessStatus(@Param('id') id: string, @Body() updateAccessDto: any) {
    return this.environmentsService.updateAccessStatus(id, updateAccessDto);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @UseGuards(RolesGuard)
  @Patch('env-access/:id')
  updateAccess(@Param('id') id: string, @Body() updateAccessDto: any) {
    return this.environmentsService.updateAccess(id, updateAccessDto);
  }
}
