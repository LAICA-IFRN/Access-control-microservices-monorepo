import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { HttpModule } from '@nestjs/axios';
import { DeviceRoutes } from './devices.routes';

@Module({
  imports: [HttpModule],
  controllers: [DevicesController],
  providers: [DevicesService, DeviceRoutes]
})
export class DevicesModule {}
