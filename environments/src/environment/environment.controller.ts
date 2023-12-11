import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { EnvStatusDto } from './dto/status-environment.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvironmentEntity } from './entities/environment.entity';
import { ConflictResponseEntity, CreateBadRequestResponseEntity, CreateForbiddenResponseEntity, CreateNotFoundResponseEntity, EnvironmentNotFoundResponseEntity, FindAllBadRequestResponseEntity, FindOneBadRequestResponseEntity, RemoveBadRequestResponseEntity, RemoveForbiddenResponseEntity, UpdateBadRequestResponseEntity, UpdateStatusForbiddenResponseEntity, UpdateStatusSuccessResponseEntity } from './entities/swagger-env-responses.entity';
import { FindAllDto } from './dto/find-all.dto';
import { CreateTemporaryAccessDto } from './dto/create-temporary-access.dto';

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
    return this.environmentService.create(createEnvironmentDto);
  }

  @Post('remote-access')
  requestRemoteAccess(
    @Query('environmentId') environmentId: string, 
    @Query('esp8266Id') esp8266Id: number,
    @Query('userId') userId: string,
    @Query('type') type: string,
  ) {
    return this.environmentService.requestRemoteAccess(environmentId, +esp8266Id, type, userId);
  }

  @Post('temporary-access')
  createTemporaryAccess(@Body() createTemporaryAccessDto: CreateTemporaryAccessDto) {
    return this.environmentService.createTemporaryAccess(createTemporaryAccessDto);
  }

  // @Get(':id/qr-code')
  // getQrCode(@Param('id') id: string) {
  //   return this.environmentService.getQRCode(id);
  // }

  @Get('remote-access')
  findRemoteAccess(@Query('esp8266Id') esp8266Id: number) {
    return this.environmentService.findRemoteAccess(esp8266Id);
  }

  @Get('mobile')
  getEnvironmentForMobile(
    @Query('userId') userId: string,
    @Query('type') type: number,
  ) {
    return this.environmentService.getEnvironmentForMobile(userId, +type);
  }

  @ApiOperation({ description: 'Endpoint para listagem de ambientes' })
  @ApiResponse({ type: EnvironmentEntity, isArray: true })
  @ApiBadRequestResponse({ type: FindAllBadRequestResponseEntity })
  @Post('paginate')
  findAll(@Body() findAllDto: FindAllDto) {
    return this.environmentService.findAll(findAllDto);
  }

  @ApiOperation({ description: 'Endpoint para busca de ambiente por ID' })
  @ApiResponse({ type: EnvironmentEntity })
  @ApiBadRequestResponse({ type: FindOneBadRequestResponseEntity })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.environmentService.findOne(id);
  }

  @ApiOperation({ description: 'Endpoint para atualização de ambiente' })
  @ApiResponse({ type: EnvironmentEntity })
  @ApiBadRequestResponse({ type: UpdateBadRequestResponseEntity })
  @ApiNotFoundResponse({ type: EnvironmentNotFoundResponseEntity })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnvironmentDto: UpdateEnvironmentDto) {
    return this.environmentService.update(id, updateEnvironmentDto);
  }
  
  @ApiOperation({ description: 'Endpoint para atualização de status de ambiente' })
  @ApiResponse({ type: UpdateStatusSuccessResponseEntity })
  @ApiForbiddenResponse({ type: UpdateStatusForbiddenResponseEntity })
  @ApiNotFoundResponse({ type: EnvironmentNotFoundResponseEntity })
  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() updateEnvironmentDto: EnvStatusDto) {
    return this.environmentService.changeStatus(id, updateEnvironmentDto.status);
  }

  @ApiOperation({ description: 'Endpoint para remoção de ambiente' })
  @ApiBadRequestResponse({ type: RemoveBadRequestResponseEntity })
  @ApiForbiddenResponse({ type: RemoveForbiddenResponseEntity })
  @ApiNotFoundResponse({ type: EnvironmentNotFoundResponseEntity })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.environmentService.remove(id);
  }
}
