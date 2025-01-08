import { Module } from '@nestjs/common';
import { MicrocontrollersService } from './microcontrollers.service';
import { MicrocontrollersController } from './microcontrollers.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogsCerberusService } from 'src/logs/logs.service';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
  ],
  controllers: [MicrocontrollersController],
  providers: [
    MicrocontrollersService,
    LogsCerberusService,
  ],
})
export class MicrocontrollersModule { }
