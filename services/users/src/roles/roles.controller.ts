import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { RoleStatusDto } from './dto/status-role.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';
import * as swagger from './entities/swagger-responses.entity';
import { VerifyRoleDto } from './dto/verify-role.dto';

@Controller()
@ApiTags('Roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @ApiOperation({ description: 'Endpoint para cadastro de papéis de usuário' })
  @ApiCreatedResponse({ type: RoleEntity })
  @ApiConflictResponse({ type: swagger.ConflictResponseEntity })
  @ApiBadRequestResponse({ type: swagger.BadRequestResponseEntity })
  @Post(':id/roles')
  create(
    @Param('id') id: string,
    @Body() createRoleDto: CreateRoleDto
  ) {
    return this.rolesService.create(createRoleDto, id);
  }

  @ApiOperation({ description: 'Endpoint para verificar se um usuário possui um papel' })
  @ApiOkResponse({ type: swagger.VerifyRoleResponseEntity })
  @ApiBadRequestResponse({ type: swagger.BadRequestVerifyResponseEntity })
  @Post('roles/verify')
  checkRole(@Body() verifyRoleDto: VerifyRoleDto) {
    console.log('verifyRoleDto', verifyRoleDto);

    const { userId, roles } = verifyRoleDto;
    return this.rolesService.checkRole(userId, roles);
  }

  @Get('role/types')
  findRolesTypes() {
    return this.rolesService.findRoles();
  }

  @ApiOperation({ description: 'Endpoint para buscar os papéis de um usuário' })
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  @Get('roles/:id/all')
  findAll(@Param('id') id: string) {
    return this.rolesService.findAll(id);
  }

  @ApiOperation({ description: 'Endpoint para alterar o status de um papel de usuário' })
  @ApiOkResponse({ type: RoleEntity })
  @ApiBadRequestResponse({ type: swagger.BadRequestResponseEntity })
  @ApiNotFoundResponse({ type: swagger.NotFoundResponseEntity })
  @Patch(':id/roles/:roleId/status')
  changeStatus(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Body() roleStatusDto: RoleStatusDto
  ) {
    return this.rolesService.changeStatus(id, roleId, roleStatusDto);
  }

  @ApiOperation({ description: 'Endpoint para remover um papel de usuário' })
  @ApiOkResponse({ type: RoleEntity })
  @ApiBadRequestResponse({ type: swagger.RemoveBadREquestResponseEntity })
  @ApiNotFoundResponse({ type: swagger.NotFoundResponseEntity })
  @Delete(':id/roles')
  remove(@Param('id') id: string, @Body() deleteRoleDto: DeleteRoleDto) {
    return this.rolesService.remove(id, deleteRoleDto);
  }
}
