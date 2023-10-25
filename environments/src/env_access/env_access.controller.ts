import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvAccessService } from './env_access.service';
import { CreateEnvAccessDto } from './dto/create-env_access.dto';
import { UpdateEnvAccessDto } from './dto/update-env_access.dto';
import { EnvAccessStatusDto } from './dto/status-env_access.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EnvAccessEntity } from './entities/env_access.entity';
import * as swagger from './entities/swagger-env-access-responses.entity'
import { FindAccessDto } from './dto/find-access.dto';

@ApiTags('EnvAccess')
@Controller('env-access')
export class EnvAccessController {
  constructor(private readonly envAccessService: EnvAccessService) {}

  @ApiOperation({ description: 'Endpoint para criar um acesso ao ambiente'})
  @ApiCreatedResponse({ type: EnvAccessEntity })
  @ApiBadRequestResponse({ type: swagger.CreateBadRequestResponseEntity })
  @ApiConflictResponse({ type: swagger.CreateConflictResponseEntity })
  @ApiNotFoundResponse({ type: swagger.CreateNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.CreateForbiddenResponseEntity })
  @Post()
  create(@Body() createEnvAccessDto: CreateEnvAccessDto) {
    return this.envAccessService.create(createEnvAccessDto);
  }

  @ApiOperation({ description: 'Endpoint para verificar paridade de horário em outro ambiente para o mesmo dia e horário de um usuário'})
  @ApiOkResponse({ type: swagger.FindParityResponseEntity, isArray: true })
  @Get('parity')
  findParity(@Body() createEnvAccessDto: CreateEnvAccessDto) {
    return this.envAccessService.findParity(createEnvAccessDto);
  }

  @ApiOperation({ description: 'Endpoint para listar todos os acessos ao ambiente'})
  @ApiOkResponse({ type: EnvAccessEntity, isArray: true })
  @Get()
  findAll() {
    return this.envAccessService.findAll();
  }

  @ApiOperation({ description: 'Endpoint para listar todos os acessos ao ambiente de um usuário'})
  @ApiOkResponse({ type: EnvAccessEntity, isArray: true })
  @Get('user/:id')
  getEnvironmentUserAccess(@Param('id') id: string) {
    return this.envAccessService.getEnvironmentUserAccess(id);
  }

  @ApiOperation({ description: 'Endpoint para verificar se um usuário possui acesso a um ambiente'})
  @ApiOkResponse({ type: swagger.VerifyAccessResponseEntity })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @Get('user/:userId/env/:envId/verify')
  verifyAccessByUser(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.envAccessService.verifyAccessByUser(userId, envId);
  }

  @Get('access')
  findAccessByUser(@Body() findAccessDto: FindAccessDto) {
    const { userId, environmentId } = findAccessDto;
    return this.envAccessService.findAccessByUser(userId, environmentId);
  }

  @ApiOperation({ description: 'Endpoint para listar todos os acessos ao ambiente de um usuário'})
  @ApiOkResponse({ type: EnvAccessEntity, isArray: true })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @Get('inactives')
  findAllInactives() {
    return this.envAccessService.findAllInactives();
  }
  
  @ApiOperation({ description: 'Endpoint para listar todos os acessos ao ambiente de um usuário'})
  @ApiOkResponse({ type: EnvAccessEntity, isArray: true })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @Get('frequenter/:id')
  findAllByFrequenter(@Param('id') id: string) {
    return this.envAccessService.findAllByFrequenter(id);
  }
  
  @ApiOperation({ description: 'Endpoint para listar todos os acessos ao ambiente de um usuário'})
  @ApiOkResponse({ type: EnvAccessEntity, isArray: true })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @Get('environment/:id')
  findAllByEnvironmentId(@Param('id') id: string) {
    return this.envAccessService.findAllByEnvironmentId(id);
  }

  @ApiOperation({ description: 'Endpoint para listar um acesso ao ambiente'})
  @ApiOkResponse({ type: EnvAccessEntity })
  @ApiNotFoundResponse({ type: swagger.EnvAccessNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.FindOneForbiddenResponseEntity })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.envAccessService.findOne(id);
  }

  @ApiOperation({ description: 'Endpoint para atualizar o status de um acesso ao ambiente' })
  @ApiOkResponse({ type: swagger.UpdateStatusSuccessResponseEntity })
  @ApiNotFoundResponse({ type: swagger.UpdateNotFoundResponseEntity })
  @ApiBadRequestResponse({ type: swagger.UpdateStatusBadRequestResponseEntity })
  @ApiForbiddenResponse({ type: swagger.UpdateForbiddenResponseEntity })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() envAccessStatusDto: EnvAccessStatusDto
  ) {
    return this.envAccessService.updateStatus(id, envAccessStatusDto);
  }

  @ApiOperation({ description: 'Endpoint para atualizar um acesso ao ambiente' })
  @ApiOkResponse({ type: EnvAccessEntity })
  @ApiNotFoundResponse({ type: swagger.UpdateNotFoundResponseEntity })
  @ApiBadRequestResponse({ type: swagger.UpdateBadRequestResponseEntity })
  @ApiForbiddenResponse({ type: swagger.UpdateForbiddenResponseEntity })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnvAccessDto: UpdateEnvAccessDto
  ) {
    return this.envAccessService.update(id, updateEnvAccessDto);
  }

  @ApiOperation({ description: 'Endpoint para remover um acesso ao ambiente' })
  // @ApiOkResponse({ type: swagger.DeleteSuccessResponseEntity })
  // @ApiNotFoundResponse({ type: swagger.DeleteNotFoundResponseEntity })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  // @ApiForbiddenResponse({ type: swagger.DeleteForbiddenResponseEntity })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.envAccessService.remove(id);
  }
}
