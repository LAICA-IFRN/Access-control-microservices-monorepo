import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Get('admin')
  findAllAdmins() {
    return this.userService.findAllAdmins();
  }

  @Get('frequenter')
  findAllFrequenters() {
    return this.userService.findAllFrequenters();
  }

  @Get('environment-manager')
  findAllEnvironmentManager() {
    return this.userService.findAllEnvironmentManager();
  }

  @Get('inactive')
  findAllInactive() {
    return this.userService.findAllInactive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.userService.updateStatus(id, body.status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.userService.update(id, body);
  }

  @Post(':id/roles')
  createRole(@Param('id') id: string, @Body() body: any) {
    return this.userService.createRole(id, body);
  }

  @Get(':id/roles')
  findAllRoles(@Param('id') id: string) {
    return this.userService.findAllRoles(id);
  }

  @Delete(':id/roles')
  removeRole(@Param('id') id: string, @Body() body: any) {
    return this.userService.removeRole(id, body);
  }

  @Patch(':id/roles/:roleId/status')
  changeRoleStatus(@Param('id') id: string, @Param('roleId') roleId: string, @Body() body: any) {
    return this.userService.changeRoleStatus(id, roleId, body.status);
  }
}
