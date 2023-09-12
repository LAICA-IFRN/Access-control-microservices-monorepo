import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';

@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Post('env')
  create(@Body() createEnvironmentDto: any) {
    return this.environmentsService.create(createEnvironmentDto);
  }

  @Get('env')
  findAll(@Query('skip') skip: number, @Query('take') take: number) {
    return this.environmentsService.findAll(skip, take);
  }

  @Get('env/:id')
  findOne(@Param('id') id: string) {
    return this.environmentsService.findOne(id);
  }

  @Patch('env/:id')
  update(@Param('id') id: string, @Body() updateEnvironmentDto: any) {
    return this.environmentsService.update(id, updateEnvironmentDto);
  }

  @Patch('env/:id/status')
  updateStatus(@Param('id') id: string, @Body() updateEnvironmentDto: any) {
    return this.environmentsService.updateStatus(id, updateEnvironmentDto);
  }

  @Delete('env/:id')
  remove(@Param('id') id: string) {
    return this.environmentsService.remove(id);
  }

  @Post('env-manager')
  createManager(@Body() createManagerDto: any) {
    return this.environmentsService.createManager(createManagerDto);
  }

  @Get('env-manager')
  findAllManagers() {
    return this.environmentsService.findAllManagers();
  }

  @Get('env-manager/:id')
  findOneManager(@Param('id') id: string) {
    return this.environmentsService.findOneManager(id);
  }

  @Get('env-manager/user/:id')
  findAllManagerByUserId(@Param('id') id: string) {
    return this.environmentsService.findAllManagerByUserId(id);
  }

  @Get('env-manager/env/:id')
  findAllManagerByEnvironmentId(@Param('id') id: string) {
    return this.environmentsService.findAllManagerByEnvironmentId(id);
  }

  @Get('env-manager/user/:userId/env/:envId/verify')
  searchAccessByUserAndEnv(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.environmentsService.searchAccessByUserAndEnv(userId, envId);
  }

  @Patch('env-manager/:id/status')
  updateManagerStatus(@Param('id') id: string, @Body() updateManagerDto: any) {
    return this.environmentsService.updateManagerStatus(id, updateManagerDto);
  }

  @Post('env-access')
  createAccess(@Body() createAccessDto: any) {
    return this.environmentsService.createAccess(createAccessDto);
  }

  @Get('env-access/parity')
  findAccessParity(@Body() createAccessDto: any) {
    return this.environmentsService.findAccessParity(createAccessDto);
  }

  @Get('env-access')
  findAllAccess() {
    return this.environmentsService.findAllAccess();
  }
  
  @Get('env-access/frequenter/:id')
  findAllByFrequenter(@Param('id') id: string) {
    return this.environmentsService.findAllByFrequenter(id);
  }
  
  @Get('env-access/inactive')
  findAllInactives() {
    return this.environmentsService.findAllInactives();
  }

  @Get('env-access/:id')
  findOneAccess(@Param('id') id: string) {
    return this.environmentsService.findOneAccess(id);
  }

  @Get(':id/env-access')
  findAllAccessByEnvironmentId(@Param('id') id: string) {
    return this.environmentsService.findAllAccessByEnvironmentId(id);
  }

  @Get('env-access/user/:userId/env/:envId/verify')
  searchManagerByUserAndEnv(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.environmentsService.searchManagerByUserAndEnv(userId, envId);
  }

  @Patch('env-access/:id/status')
  updateAccessStatus(@Param('id') id: string, @Body() updateAccessDto: any) {
    return this.environmentsService.updateAccessStatus(id, updateAccessDto);
  }

  @Patch('env-access/:id')
  updateAccess(@Param('id') id: string, @Body() updateAccessDto: any) {
    return this.environmentsService.updateAccess(id, updateAccessDto);
  }
}
