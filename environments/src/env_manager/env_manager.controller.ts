import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { EnvManagerService } from './env_manager.service';
import { CreateEnvManagerDto } from './dto/create-env_manager.dto';
import { EnvManagerStatusDto } from './dto/status-env_manager.dto';
import * as swagger from './entities/swagger-env-manager-responses.entity';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvManagerEntity } from './entities/env_manager.entity';
import { FindAccessDto } from './dto/find-access.dto';

@ApiTags('EnvManager')
@Controller('env-manager')
export class EnvManagerController {
  constructor(private readonly envManagerService: EnvManagerService) {}

  @ApiOperation({ description: 'Endpoint para criar um novo gestor de ambiente' })
  @ApiCreatedResponse({ type: EnvManagerEntity })
  @ApiBadRequestResponse({ type: swagger.CreateBadRequestResponseEntity })
  @ApiConflictResponse({ type: swagger.CreateConflictResponseEntity })
  @ApiForbiddenResponse({ type: swagger.CreateForbiddenResponseEntity })
  @ApiNotFoundResponse({ type: swagger.CreateNotFoundResponseEntity })
  @Post()
  create(@Body() createEnvManagerDto: CreateEnvManagerDto) {
    return this.envManagerService.create(createEnvManagerDto);
  }

  @Get('access')
  findAccessByUser(@Body() findAccessDto: FindAccessDto) {
    console.log(findAccessDto);
    
    const { userId, environmentId } = findAccessDto;
    return this.envManagerService.findAccessByUser(userId, environmentId);
  }

  @ApiOperation({ description: 'Endpoint para listar todos os gestores de ambiente' })
  @ApiOkResponse({ type: EnvManagerEntity, isArray: true })
  @ApiBadRequestResponse({ type: swagger.FindAllBadRequestResponseEntity })
  @Get()
  findAll() {
    return this.envManagerService.findAll();
  }

  @ApiOperation({ description: 'Endpoint para verificar se um usuário possui acesso a um ambiente'})
  @ApiOkResponse({ type: swagger.VerifyManagerResponseEntity })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @Get('user/:userId/env/:envId/verify')
  verifyManagerByUser(@Param('userId') userId: string, @Param('envId') envId: string) {
    return this.envManagerService.verifyManagerByUser(userId, envId);
  }

  @ApiOperation({ description: 'Endpoint para listar um gestor de ambiente' })
  @ApiOkResponse({ type: EnvManagerEntity })
  @ApiForbiddenResponse({ type: swagger.FindOneForbiddenResponseEntity })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @ApiNotFoundResponse({ type: swagger.EnvManagerNotFoundResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.envManagerService.findOne(id);
  }

  @ApiOperation({ description: 'Endpoint para listar todos os gestores de ambiente de um usuário' })
  @ApiOkResponse({ type: EnvManagerEntity, isArray: true })
  @ApiBadRequestResponse({ 
    type: swagger.FindAllBadRequestResponseEntity 
  })
  @Get('user/:id')
  findAllByUserId(@Param('id') id: string) {
    return this.envManagerService.findAllByUserId(id);
  }

  @ApiOperation({ description: 'Endpoint para listar todos os gestores de ambiente de um ambiente' })
  @ApiOkResponse({ type: EnvManagerEntity, isArray: true })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @Get('environment/:id')
  findAllByEnvironmentId(@Param('id') id: string) {
    return this.envManagerService.findAllByEnvironmentId(id);
  }

  @ApiOperation({ description: 'Endpoint para atualizar o status de um gestor de ambiente' })
  @ApiOkResponse({ type: swagger.UpdateStatusSuccessResponseEntity })
  @ApiBadRequestResponse({ type: swagger.InvalidIdBadRequestResponseEntity })
  @ApiNotFoundResponse({ type: swagger.EnvManagerNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.UpdateStatusForbiddenResponseEntity })
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() envManagerStatusDto: EnvManagerStatusDto
  ) {
    return this.envManagerService.updateStatus(id, envManagerStatusDto);
  }
}
