import { Controller, Get, Post, Body, Patch, Param, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
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
  NotFoundToToken,
  OkToAccess,
  OkToToken,
  UnauthorizedToAccess,
  UnauthorizedToToken
} from './entities/swagger-responses.entity';
import { FindToAccess } from './dto/find-to-access.dto';
import { ValidateToToken } from './dto/validate-to-token.dto';
import { CreateUserByInvitationDto } from './dto/create-user-by-invitaion.dto';
import { FindAllDto } from './dto/find-all.dto';

@Controller()
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: 'Endpoint para cadastro de usuários' })
  @ApiCreatedResponse({ type: UserEntity })
  @ApiConflictResponse({type: ConflictResponseEntity })
  @ApiBadRequestResponse({ type: BadRequestResponseEntity })
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body, '');
  }

  @Post('frequenter/invited')
  createUserByInvitation(@Body() createUserByInvitationDto: CreateUserByInvitationDto) {
    return this.userService.createUserByInvitation(createUserByInvitationDto);
  }

  @ApiOperation({ description: 'Endpoint para envio de email de convite' })
  @Post('invite')
  sendInviteEmail(@Query('email') email: string, @Query('path') path: string) {
    return this.userService.sendInviteEmail(email, path);
  }

  @Post('paginate')
  findAll(@Body() body: FindAllDto) {
    return this.userService.findAll(body);
  }

  @ApiOperation({ description: 'Endpoint para buscar um usuário para o serviço de acesso' })
  @ApiNotFoundResponse({ type: NotFoundToAccess })
  @ApiOkResponse({ type: OkToAccess })
  @ApiUnauthorizedResponse({ type: UnauthorizedToAccess })
  @Get('access')
  findOneToAccess(@Body() findToAccess: FindToAccess) {
    return this.userService.findOneToAccess(findToAccess);
  }

  @ApiOperation({ description: 'Endpoint para validar usuário para criação de token de autorização' })
  @ApiOkResponse({ type: OkToToken })
  @ApiUnauthorizedResponse({ type: UnauthorizedToToken })
  @ApiNotFoundResponse({ type: NotFoundToToken })
  @Get('validate')
  validateToToken(@Body() validateToToken: ValidateToToken) {
    return this.userService.validateToToken(validateToToken);
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
  
  @Get(':id/image')
  findUserImage(@Param('id') id: string) {
    return this.userService.findUserImage(id);
  }

  @ApiOperation({ description: 'Endpoint para buscar um usuário' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({type: NotFoundResponseEntity })
  @ApiBadRequestResponse({ type: IdParamInvalidResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('findOne');
    return this.userService.findOne(id);
  }
  

  @ApiOperation({ description: 'Endpoint para atualizar o status de um usuário' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({type: NotFoundResponseEntity })
  @ApiBadRequestResponse({ type: IdParamInvalidResponseEntity })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UserStatusDto) {
    return this.userService.updateStatus(id, body.status, '');
  }

  @ApiOperation({ description: 'Endpoint para atualizar os dados de um usuário' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({type: NotFoundResponseEntity })
  @ApiBadRequestResponse({ type: IdParamInvalidResponseEntity })
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDataDto) {
    return this.userService.update(id, body, '');
  }
}
