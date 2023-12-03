import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MicrocontrollersService } from './microcontrollers.service';
import { CreateMicrocontrollerDto } from './dto/create-microcontroller.dto';
import { FindOneByMacDto } from './dto/find-by-mac.dto';
import { FindAllDto } from 'src/utils/find-all.dto';

@Controller('microcontrollers')
export class MicrocontrollersController {
  constructor(private readonly microcontrollersService: MicrocontrollersService) {}

  @Post()
  async create(@Body() createMicrocontrollerDto: CreateMicrocontrollerDto) {
    return this.microcontrollersService.createMicrocontroller(createMicrocontrollerDto);
  }

  @Post('activate')
  async activate(
    @Query('id') id: number,
    @Query('environmentId') environmentId: string,
  ) {
    return this.microcontrollersService.activateMicrocontroller(+id, environmentId);
  }

  @Post('keep-alive')
  async setMicrocontrollerInfo(
    @Query('id') id: number,
    @Query('healthCode') healthCode: number,
    @Query('doorStatus') doorStatus: boolean,
  ) {
    return this.microcontrollersService.setMicrocontrollerInfo(+id, +healthCode, doorStatus);
  }

  @Post('cold-start')
  async coldStartMicrocontroller(
    @Query('id') id: number,
  ) {
    return this.microcontrollersService.coldStartMicrocontroller(+id);
  }

  @Get('remote-access/:id')
  searchRemoteAccess(@Param('id') id: number) {
    console.log('searchRemoteAccess');
    return this.microcontrollersService.searchRemoteAccess(+id);
  }

  @Get('keep-alive')
  async getMicrocontrollerInfo(
    @Query('id') id: number,
  ) {
    return this.microcontrollersService.getMicrocontrollerInfo(+id);
  }

  @Post('paginate')
  async findAll(@Body() findAllDto: FindAllDto) {
    return this.microcontrollersService.findAll(findAllDto);
  }

  @Post('inactives')
  async findAllInactives(@Body() findAllDto: FindAllDto) {
    return this.microcontrollersService.findAllInactives(findAllDto);
  }

  @Get('mac')
  findOneByMac(@Body() findOneByMac: FindOneByMacDto) {
    return this.microcontrollersService.findOneByMac(findOneByMac);
  }

  @Get('environment/:environmentId')
  findAllByEnvironmentId(@Param('environmentId') environmentId: string) {
    return this.microcontrollersService.findAllByEnvironmentId(environmentId);
  }

  @Get('one/:id')
  findOne(@Param('id') id: number) {
    console.log('findOne');
    return this.microcontrollersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMicrocontrollerDto: CreateMicrocontrollerDto) {
    return this.microcontrollersService.update(+id, updateMicrocontrollerDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Query('status') status: boolean) {
    return this.microcontrollersService.updateStatus(+id, status);
  }
}
