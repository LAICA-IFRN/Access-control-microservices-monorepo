import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Esp8266Service } from './esp8266.service';
import { CreateEsp8266Dto } from './dto/create-esp8266.dto';
import { UpdateEsp8266Dto } from './dto/update-esp8266.dto';
import { UpdateStatusEspDto } from 'src/esp32/dto/update-status-esp.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Esp8266')
@Controller('esp8266')
export class Esp8266Controller {
  constructor(private readonly esp8266Service: Esp8266Service) {}

  // configurar o swagger para os endpoints similar ao ../esp32/esp32.controller.ts
  @ApiOperation({ description: 'Endpoint' }) 
  @Post()
  create(@Body() createEsp8266Dto: CreateEsp8266Dto) {
    return this.esp8266Service.create(createEsp8266Dto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: number, 
    @Query('take') take?: number
  ) {
    return this.esp8266Service.findAll(+skip, +take);
  }

  @Get('environment/:environmentId')
  findAllByEnvironmentId(@Param('environmentId') environmentId: string) {
    return this.esp8266Service.findAllByEnvironmentId(environmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.esp8266Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateEsp8266Dto: UpdateEsp8266Dto) {
    return this.esp8266Service.update(+id, updateEsp8266Dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body() updateStatusEspDto: UpdateStatusEspDto) {
    return this.esp8266Service.updateStatus(+id, updateStatusEspDto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.esp8266Service.remove(+id);
  }
}
