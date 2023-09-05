import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Esp32Service } from './esp32.service';
import { CreateEsp32Dto } from './dto/create-esp32.dto';
import { UpdateEsp32Dto } from './dto/update-esp32.dto';
import { UpdateStatusEspDto } from './dto/update-status-esp.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Esp32Entity } from './entities/esp32.entity';
import * as swagger from './entities/swagger-responses.entity';

@ApiTags('Esp32')
@Controller('esp32')
export class Esp32Controller {
  constructor(private readonly esp32Service: Esp32Service) {}

  @ApiOperation({ description: 'Endpoint para cadastrar um esp32' })
  @ApiCreatedResponse({ type: Esp32Entity })
  @ApiBadRequestResponse({ type: swagger.CreateBadRequestResponseEntity })
  @ApiConflictResponse({ type: swagger.CreateConflictResponseEntity })
  @ApiNotFoundResponse({ type: swagger.CreateNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.CreateForbiddenResponseEntity })
  @Post()
  create(@Body() createEsp32Dto: CreateEsp32Dto) {
    return this.esp32Service.create(createEsp32Dto);
  }

  @ApiOperation({ description: 'Endpoint para listar os esp32' })
  @ApiCreatedResponse({ type: Esp32Entity, isArray: true })
  @ApiBadRequestResponse({ type: swagger.FindAllBadRequestResponseEntity })
  @ApiForbiddenResponse({ type: swagger.FindAllForbiddenResponseEntity })
  @Get()
  findAll(
    @Query('skip') skip: number,
    @Query('take') take: number
  ) {
    return this.esp32Service.findAll(+skip, +take);
  }

  @ApiOperation({ description: 'Endpoint para listar os esp32 de um ambiente' })
  @ApiOkResponse({ type: Esp32Entity, isArray: true })
  @ApiNotFoundResponse({ type: swagger.FindAllNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.FindAllForbiddenResponseEntity })
  @ApiBadRequestResponse({ type: swagger.IdParamInvalidResponseEntity })
  @Get('environment/:environmentId')
  findAllByEnvironmentId(@Param('environmentId') environmentId: string) {
    return this.esp32Service.findAllByEnvironmentId(environmentId);
  }

  @ApiOperation({ description: 'Endpoint para buscar um esp32' })
  @ApiOkResponse({ type: Esp32Entity })
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @ApiBadRequestResponse({ type: swagger.IdParamInvalidResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.esp32Service.findOne(+id);
  }

  @ApiOperation({ description: 'Endpoint para atualizar um esp32' })
  @ApiOkResponse({ type: Esp32Entity })
  @ApiBadRequestResponse({ type: swagger.CreateBadRequestResponseEntity })
  @ApiConflictResponse({ type: swagger.CreateConflictResponseEntity })
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateEsp32Dto: UpdateEsp32Dto) {
    return this.esp32Service.update(+id, updateEsp32Dto);
  }

  @ApiOperation({ description: 'Endpoint para atualizar o status de um esp32' })
  @ApiOkResponse({ type: Esp32Entity })
  @ApiBadRequestResponse({ type: swagger.UpdateStatusBadRequesteEntity})
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body() updateStatusEspDto: UpdateStatusEspDto) {
    return this.esp32Service.updateStatus(+id, updateStatusEspDto.status);
  }

  @ApiOperation({ description: 'Endpoint para deletar um esp32' })
  @ApiOkResponse({ type: Esp32Entity })
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @ApiForbiddenResponse({ type: swagger.RemoveForbiddenResponseEntity })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.esp32Service.remove(+id);
  }

  @ApiOperation({ description: 'Endpoint para desconectar o esp8266 do esp32' })
  @ApiOkResponse({ type: Esp32Entity })
  @ApiNotFoundResponse({ type: swagger.FindOneNotFoundResponseEntity })
  @Patch(':id/disconnect/esp8266')
  disconnectEsp8266(@Param('id') id: number) {
    return this.esp32Service.disconnectEsp8266(+id);
  }
}
