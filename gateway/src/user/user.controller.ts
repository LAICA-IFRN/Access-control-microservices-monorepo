import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesConstants } from 'src/utils/constants';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Post('frequenter/invited')
  createByInvitation(@Body() body: any) {
    return this.userService.createByInvitation(body);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Post('invite')
  sendInviteEmail(@Query('email') email: string, @Query('path') path: string) {
    return this.userService.sendInviteEmail(email, path);
  }

  @Post('paginate')
  findAll(@Body() body: any) {
    return this.userService.findAll(body);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Get(':id/image')
  findUserImage(@Param('id') id: string) {
    return this.userService.findUserImage(id);
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Get('admin')
  findAllAdmins() {
    return this.userService.findAllAdmins();
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Get('frequenter')
  findAllFrequenters() {
    return this.userService.findAllFrequenters();
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Get('environment-manager')
  findAllEnvironmentManager() {
    return this.userService.findAllEnvironmentManager();
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Get('inactive')
  findAllInactive() {
    return this.userService.findAllInactive();
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.userService.updateStatus(id, body.status);
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.userService.update(id, body);
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Post(':id/roles')
  createRole(@Param('id') id: string, @Body() body: any) {
    return this.userService.createRole(id, body);
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Get(':id/roles')
  findAllRolesFromUser(@Param('id') id: string) {
    return this.userService.findAllRolesFromUser(id);
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Delete(':id/roles')
  removeRole(@Param('id') id: string, @Body() body: any) {
    return this.userService.removeRole(id, body);
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  @Patch(':id/roles/:roleId/status')
  changeRoleStatus(@Param('id') id: string, @Param('roleId') roleId: string, @Body() body: any) {
    return this.userService.changeRoleStatus(id, roleId, body);
  }
}
