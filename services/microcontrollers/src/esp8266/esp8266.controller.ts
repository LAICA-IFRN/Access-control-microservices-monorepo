import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Esp8266Service } from './esp8266.service';
import { CreateEsp8266Dto } from './dto/create-esp8266.dto';
import { UpdateEsp8266Dto } from './dto/update-esp8266.dto';
import { UpdateStatusEspDto } from 'src/esp32/dto/update-status-esp.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Esp8266Entity } from './entities/esp8266.entity';
import * as swagger from './entities/swagger-responses.entity';

@ApiTags('Esp8266')
@Controller('esp8266')
export class Esp8266Controller {
  constructor(private readonly esp8266Service: Esp8266Service) {}

  // configurar o swagger para os endpoints similar ao ../esp32/esp32.controller.ts
  @ApiOperation({ description: 'Endpoint para cadastrar um esp8266' }) 
  @ApiCreatedResponse({ type: Esp8266Entity })
  @ApiBadRequestResponse({ type: swagger.CreateBadRequestResponseEntity })
  @ApiConflictResponse({ type: swagger.CreateConflictResponseEntity })
  @ApiNotFoundResponse({ type: swagger.CreateNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.CreateForbiddenResponseEntity })
  @Post()
  create(@Body() createEsp8266Dto: CreateEsp8266Dto) {
    return this.esp8266Service.create(createEsp8266Dto);
  }

  @ApiOperation({ description: 'Endpoint para listar os esp8266' })
  @ApiCreatedResponse({ type: Esp8266Entity, isArray: true })
  @ApiBadRequestResponse({ type: swagger.FindAllBadRequestResponseEntity })
  @ApiForbiddenResponse({ type: swagger.FindAllForbiddenResponseEntity })
  @Get()
  findAll(
    @Query('skip') skip?: number, 
    @Query('take') take?: number
  ) {
    return this.esp8266Service.findAll(+skip, +take);
  }

  @ApiOperation({ description: 'Endpoint para listar os esp8266 de um ambiente' })
  @ApiOkResponse({ type: Esp8266Entity, isArray: true })
  @ApiNotFoundResponse({ type: swagger.FindAllNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.FindAllForbiddenResponseEntity })
  @ApiBadRequestResponse({ type: swagger.IdParamInvalidResponseEntity })
  @Get('environment/:environmentId')
  findAllByEnvironmentId(@Param('environmentId') environmentId: string) {
    return this.esp8266Service.findAllByEnvironmentId(environmentId);
  }

  @ApiOperation({ description: 'Endpoint para buscar um esp8266' })
  @ApiOkResponse({ type: Esp8266Entity })
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @ApiBadRequestResponse({ type: swagger.IdParamInvalidResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.esp8266Service.findOne(+id);
  }

  @ApiOperation({ description: 'Endpoint para atualizar um esp8266' })
  @ApiOkResponse({ type: Esp8266Entity })
  @ApiBadRequestResponse({ type: swagger.CreateBadRequestResponseEntity })
  @ApiConflictResponse({ type: swagger.CreateConflictResponseEntity })
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateEsp8266Dto: UpdateEsp8266Dto) {
    return this.esp8266Service.update(+id, updateEsp8266Dto);
  }

  @ApiOperation({ description: 'Endpoint para atualizar o status de um esp8266' })
  @ApiOkResponse({ type: Esp8266Entity })
  @ApiBadRequestResponse({ type: swagger.UpdateStatusBadRequesteEntity})
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body() updateStatusEspDto: UpdateStatusEspDto) {
    return this.esp8266Service.updateStatus(+id, updateStatusEspDto.status);
  }

  @ApiOperation({ description: 'Endpoint para deletar um esp8266' })
  @ApiOkResponse({ type: Esp8266Entity })
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.RemoveForbiddenResponseEntity })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.esp8266Service.remove(+id);
  }
}
