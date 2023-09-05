import { Module } from '@nestjs/common';
import { MicrocontrollersService } from './microcontrollers.service';
import { MicrocontrollersController } from './microcontrollers.controller';
import { HttpModule } from '@nestjs/axios';
import { MicrocontrollersRoutes } from './microcontrollers.routes';

@Module({
  imports: [HttpModule],
  controllers: [MicrocontrollersController],
  providers: [MicrocontrollersService, MicrocontrollersRoutes]
})
export class MicrocontrollersModule {}
