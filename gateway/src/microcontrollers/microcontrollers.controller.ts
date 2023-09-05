import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MicrocontrollersService } from './microcontrollers.service';

@Controller('microcontrollers')
export class MicrocontrollersController {
  constructor(private readonly microcontrollersService: MicrocontrollersService) {}

  @Post('esp32')
  createEsp32(@Body() createMicrocontrollerDto: any) {
    return this.microcontrollersService.createEsp32(createMicrocontrollerDto);
  }

  @Get('esp32')
  findAllEsp32(
    @Query('skip') skip: number,
    @Query('take') take: number
  ) {
    return this.microcontrollersService.findAllEsp32(+skip, +take);
  }

  @Get('esp32/environment/:environmentId')
  findAllEsp32ByEnvironmentId(@Param('environmentId') environmentId: string) {
    return this.microcontrollersService.findAllEsp32ByEnvironmentId(environmentId);
  }

  @Get('esp32/:id')
  findOneEsp32(@Param('id') id: number) {
    return this.microcontrollersService.findOneEsp32(+id);
  }

  @Patch('esp32/:id')
  updateEsp32(@Param('id') id: number, @Body() updateMicrocontrollerDto: any) {
    return this.microcontrollersService.updateEsp32(+id, updateMicrocontrollerDto);
  }

  @Patch('esp32/:id/status')
  updateStatusEsp32(@Param('id') id: number, @Body() updateMicrocontrollerStatusDto: any) {
    return this.microcontrollersService.updateStatusEsp32(+id, updateMicrocontrollerStatusDto);
  }

  @Delete('esp32/:id')
  removeEsp32(@Param('id') id: number) {
    return this.microcontrollersService.removeEsp32(+id);
  }

  @Patch('esp32/:id/disconnect/esp8266')
  disconnectEsp8266(@Param('id') id: number) {
    return this.microcontrollersService.disconnectEsp8266(+id);
  }

  @Post('esp8266')
  createEsp8266(@Body() createMicrocontrollerDto: any) {
    console.log('createEsp8266')
    return this.microcontrollersService.createEsp8266(createMicrocontrollerDto);
  }

  @Get('esp8266')
  findAllEsp8266(
    @Query('skip') skip: number,
    @Query('take') take: number
  ) {
    return this.microcontrollersService.findAllEsp8266(+skip, +take);
  }

  @Get('esp8266/environment/:environmentId')
  findAllEsp8266ByEnvironmentId(@Param('environmentId') environmentId: string) {
    return this.microcontrollersService.findAllEsp8266ByEnvironmentId(environmentId);
  }

  @Get('esp8266/:id')
  findOneEsp8266(@Param('id') id: number) {
    return this.microcontrollersService.findOneEsp8266(+id);
  }

  @Patch('esp8266/:id')
  updateEsp8266(@Param('id') id: number, @Body() updateMicrocontrollerDto: any) {
    return this.microcontrollersService.updateEsp8266(+id, updateMicrocontrollerDto);
  }

  @Patch('esp8266/:id/status')
  updateStatusEsp8266(@Param('id') id: number, @Body() updateMicrocontrollerStatusDto: any) {
    return this.microcontrollersService.updateStatusEsp8266(+id, updateMicrocontrollerStatusDto);
  }

  @Delete('esp8266/:id')
  removeEsp8266(@Param('id') id: number) {
    return this.microcontrollersService.removeEsp8266(+id);
  }
}
