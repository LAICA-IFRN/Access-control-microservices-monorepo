import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRequestEntity } from './entities/user-request.entity';
import { ApiBadRequestResponse, 
  ApiConflictResponse, 
  ApiCreatedResponse, 
  ApiNotFoundResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiTags, 
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { UserStatusDto } from './dto/status-user.dto';
import { UpdateUserDataDto } from './dto/update-user-data.dto';
import { UserEntity } from './entities/user.entity';
import { BadRequestResponseEntity, 
  ConflictResponseEntity, 
  IdParamInvalidResponseEntity, 
  NotFoundResponseEntity, 
  NotFoundToAccess,
  OkToAccess,
  UnauthorizedToAccess
} from './entities/swagger-responses.entity';
import { FindToAccess } from './dto/find-to-access.dto';

@Controller()
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: 'Endpoint para cadastro de usuários' })
  @ApiCreatedResponse({ type: UserEntity })
  @ApiConflictResponse({type: ConflictResponseEntity })
  @ApiBadRequestResponse({ type: BadRequestResponseEntity })
  @Post()
  create(@Body() body: CreateUserDto, @Req() req: UserRequestEntity) {
    const requestUser = req.user
    return this.userService.create(body);
  }

  @ApiOperation({ description: 'Endpoint para buscar um usuário para o serviço de acesso' })
  @ApiNotFoundResponse({ type: NotFoundToAccess })
  @ApiOkResponse({ type: OkToAccess })
  @ApiUnauthorizedResponse({ type: UnauthorizedToAccess })
  @Get('access')
  findOneToAccess(@Body() findToAccess: FindToAccess) {
    console.log('findOneToAccess');
    
    return this.userService.findOneToAccess(findToAccess);
  }

  @ApiOperation({ description: 'Endpoint para buscar os usuários administradores' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @Get('admin')
  findAllAdmins() {
    return this.userService.findAllAdmins();
  }

  @ApiOperation({ description: 'Endpoint para buscar os usuários frequentadores' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @Get('frequenter')
  findAllFrequenters() {
    return this.userService.findAllFrequenters();
  }

  @ApiOperation({ description: 'Endpoint para buscar os usuários gestores de ambiente' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @Get('environment-manager')
  findAllEnvironmentManager() {
    return this.userService.findAllEnvironmentManager();
  }

  @ApiOperation({ description: 'Endpoint para buscar os usuários inativos no sistema' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @Get('inactive')
  findAllInactive() {
    return this.userService.findAllInactive();
  }

  @ApiOperation({ description: 'Endpoint para buscar um usuário' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({type: NotFoundResponseEntity })
  @ApiBadRequestResponse({ type: IdParamInvalidResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ description: 'Endpoint para atualizar o status de um usuário' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({type: NotFoundResponseEntity })
  @ApiBadRequestResponse({ type: IdParamInvalidResponseEntity })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UserStatusDto) {
    console.log('update status');

    return this.userService.updateStatus(id, body.status);
  }

  @ApiOperation({ description: 'Endpoint para atualizar os dados de um usuário' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({type: NotFoundResponseEntity })
  @ApiBadRequestResponse({ type: IdParamInvalidResponseEntity })
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDataDto) {
    console.log('update');
    
    return this.userService.update(id, body);
  }
}
