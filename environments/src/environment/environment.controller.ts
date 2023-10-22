import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { EnvStatusDto } from './dto/status-environment.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvironmentEntity } from './entities/environment.entity';
import { ConflictResponseEntity, CreateBadRequestResponseEntity, CreateForbiddenResponseEntity, CreateNotFoundResponseEntity, EnvironmentNotFoundResponseEntity, FindAllBadRequestResponseEntity, FindOneBadRequestResponseEntity, RemoveBadRequestResponseEntity, RemoveForbiddenResponseEntity, UpdateBadRequestResponseEntity, UpdateStatusForbiddenResponseEntity, UpdateStatusSuccessResponseEntity } from './entities/swagger-env-responses.entity';

@ApiTags('Env')
@Controller('env')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @ApiOperation({ description: 'Endpoint para cadastro de ambientes' })
  @ApiCreatedResponse({ type: EnvironmentEntity })
  @ApiForbiddenResponse({ type: CreateForbiddenResponseEntity })
  @ApiConflictResponse({ type: ConflictResponseEntity })
  @ApiNotFoundResponse({ type: CreateNotFoundResponseEntity })
  @ApiBadRequestResponse({ type: CreateBadRequestResponseEntity})
  @Post()
  create(@Body() createEnvironmentDto: CreateEnvironmentDto) {
    console.log('env create')
    return this.environmentService.create(createEnvironmentDto);
  }

  @Post('remote-access')
  requestRemoteAccess(
    @Query('environmentId') environmentId: string, 
    @Query('esp8266Id') esp8266Id: number,
    @Query('userId') userId: string,
  ) {
    return this.environmentService.requestRemoteAccess(environmentId, +esp8266Id, userId);
  }

  @Get('remote-access')
  findRemoteAccess(@Query('esp8266Id') esp8266Id: number) {
    return this.environmentService.findRemoteAccess(esp8266Id);
  }

  @ApiOperation({ description: 'Endpoint para listagem de ambientes' })
  @ApiResponse({ type: EnvironmentEntity, isArray: true })
  @ApiBadRequestResponse({ type: FindAllBadRequestResponseEntity })
  @Get()
  findAll(
    @Query('skip') skip: number, 
    @Query('take') take: number
  ) {
    console.log('env findAll')
    const skipNumber = skip ? parseInt(skip.toString()) : 0;
    const takeNumber = take ? parseInt(take.toString()) : 10;
    return this.environmentService.findAll(skipNumber, takeNumber);
  }

  @ApiOperation({ description: 'Endpoint para busca de ambiente por ID' })
  @ApiResponse({ type: EnvironmentEntity })
  @ApiBadRequestResponse({ type: FindOneBadRequestResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('env findOne')
    return this.environmentService.findOne(id);
  }

  @ApiOperation({ description: 'Endpoint para atualização de ambiente' })
  @ApiResponse({ type: EnvironmentEntity })
  @ApiBadRequestResponse({ type: UpdateBadRequestResponseEntity })
  @ApiNotFoundResponse({ type: EnvironmentNotFoundResponseEntity })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnvironmentDto: UpdateEnvironmentDto) {
    console.log('env update')
    return this.environmentService.update(id, updateEnvironmentDto);
  }
  
  @ApiOperation({ description: 'Endpoint para atualização de status de ambiente' })
  @ApiResponse({ type: UpdateStatusSuccessResponseEntity })
  @ApiForbiddenResponse({ type: UpdateStatusForbiddenResponseEntity })
  @ApiNotFoundResponse({ type: EnvironmentNotFoundResponseEntity })
  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() updateEnvironmentDto: EnvStatusDto) {
    console.log('env changeStatus')
    return this.environmentService.changeStatus(id, updateEnvironmentDto.status);
  }

  @ApiOperation({ description: 'Endpoint para remoção de ambiente' })
  @ApiBadRequestResponse({ type: RemoveBadRequestResponseEntity })
  @ApiForbiddenResponse({ type: RemoveForbiddenResponseEntity })
  @ApiNotFoundResponse({ type: EnvironmentNotFoundResponseEntity })
  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('env remove')
    return this.environmentService.remove(id);
  }
}
