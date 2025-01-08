import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogEntity } from './entities/log.entity';
import { FindAllBadRequestResponseEntity, CreateBadRequestResponseEntity } from './entities/swagger-responses.entity';
import { FindAllDto } from 'src/utils/find-all.dto';

@ApiTags('Logs')
@Controller('')
export class LogsController {
  constructor(private readonly logsService: LogsService) { }

  @ApiOperation({ description: 'Endpoint para cadastro de logs' })
  @ApiCreatedResponse({ type: LogEntity })
  @ApiBadRequestResponse({ type: CreateBadRequestResponseEntity })
  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.logsService.create(createLogDto);
  }

  @ApiOperation({ description: 'Endpoint para buscar os logs' })
  @ApiOkResponse({ type: LogEntity, isArray: true })
  @ApiBadRequestResponse({ type: FindAllBadRequestResponseEntity })
  @Post('search')
  findAll(@Body() findAllDto: FindAllDto) {
    return this.logsService.findAll(findAllDto);
  }
}
