import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('admin')
  findAllAdmins() {
    return this.userService.findAllAdmins();
  }

  @Roles('ADMIN', 'ENVIRONMENT_MANAGER')
  @UseGuards(RolesGuard)
  @Get('frequenter')
  findAllFrequenters() {
    return this.userService.findAllFrequenters();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('environment-manager')
  findAllEnvironmentManager() {
    return this.userService.findAllEnvironmentManager();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('inactive')
  findAllInactive() {
    return this.userService.findAllInactive();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.userService.updateStatus(id, body.status);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.userService.update(id, body);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post(':id/roles')
  createRole(@Param('id') id: string, @Body() body: any) {
    return this.userService.createRole(id, body);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get(':id/roles')
  findAllRoles(@Param('id') id: string) {
    return this.userService.findAllRoles(id);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id/roles')
  removeRole(@Param('id') id: string, @Body() body: any) {
    return this.userService.removeRole(id, body);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Patch(':id/roles/:roleId/status')
  changeRoleStatus(@Param('id') id: string, @Param('roleId') roleId: string, @Body() body: any) {
    return this.userService.changeRoleStatus(id, roleId, body);
  }
}
