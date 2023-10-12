import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogEntity } from './entities/log.entity';
import { FindAllBadRequestResponseEntity, CreateBadRequestResponseEntity } from './entities/swagger-responses.entity';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

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
  @Get()
  search(
    @Query('type') type: string,
    @Query('topic') topic: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const parsedSkip = skip ? parseInt(skip) : 0;
    const parsedTake = take ? parseInt(take) : 10;
    return this.logsService.search(type, topic, parsedSkip, parsedTake);
  }
}
