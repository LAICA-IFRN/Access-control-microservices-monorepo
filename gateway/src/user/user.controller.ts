import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationTypeConstants, RolesConstants } from 'src/utils/constants';
import { AuthorizationType } from 'src/decorators/authorization-type.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('dashboard')
  dashboardConsultData() {
    return this.userService.dashboardConsultData();
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.userService.create({ ...body, requestUserId: userId });
  }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @AuthorizationType(AuthorizationTypeConstants.WEB)
  //@UseGuards(RolesGuard)
  @Post('user/invited')
  createByInvitation(@Body() body: any) {
    return this.userService.createByInvitation(body);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('invite')
  sendInviteEmail(@Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.userService.sendInviteEmail({ ...body, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post('paginate')
  findAll(@Body() body: any) {
    console.log(body);
    return this.userService.findAll(body);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('document-types')
  findDocumentTypes() {
    return this.userService.findDocumentTypes();
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get(':id/image')
  findUserImage(@Param('id') id: string) {
    return this.userService.findUserImage(id);
  }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  // @Get('admin')
  // findAllAdmins() {
  //   return this.userService.findAllAdmins();
  // }

  // @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  // @UseGuards(RolesGuard)
  // @Get('frequenter')
  // findAllFrequenters() {
  //   return this.userService.findAllFrequenters();
  // }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  // @Get('environment-manager')
  // findAllEnvironmentManager() {
  //   return this.userService.findAllEnvironmentManager();
  // }

  // @Roles(RolesConstants.ADMIN)
  // @UseGuards(RolesGuard)
  // @Get('inactive')
  // findAllInactive() {
  //   return this.userService.findAllInactive();
  // }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER, RolesConstants.FREQUENTER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.userService.updateStatus(id, { ...body, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.userService.update(id, { ...body, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Post(':id/roles')
  createRole(@Param('id') id: string, @Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.userService.createRole(id, { ...body, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get('role/types')
  findRolesTypes() {
    return this.userService.findRolesTypes();
  }

  @Roles(RolesConstants.ADMIN, RolesConstants.ENVIRONMENT_MANAGER)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Get(':id/roles')
  findAllRolesFromUser(@Param('id') id: string) {
    return this.userService.findAllRolesFromUser(id);
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Delete(':id/roles')
  removeRole(@Param('id') id: string, @Body() body: any, @Req() request: Request) {
    const userId = request['userId'];
    return this.userService.removeRole(id, { ...body, requestUserId: userId });
  }

  @Roles(RolesConstants.ADMIN)
  @AuthorizationType(AuthorizationTypeConstants.WEB)
  @UseGuards(RolesGuard)
  @Patch(':id/roles/:roleId/status')
  changeRoleStatus(
    @Param('id') id: string, 
    @Param('roleId') roleId: string, 
    @Body() body: any, 
    @Req() request: Request
  ) {
    const userId = request['userId'];
    return this.userService.changeRoleStatus(id, roleId, { ...body, requestUserId: userId });
  }
}
