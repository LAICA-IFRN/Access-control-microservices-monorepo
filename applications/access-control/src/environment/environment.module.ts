import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { LogsCerberusService } from 'src/logs/logs.service';
// import { MicrocontrollersService } from 'src/microcontrollers/microcontrollers.service';
// import { MicrocontrollersModule } from 'src/microcontrollers/microcontrollers.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    // MicrocontrollersModule,
  ],
  controllers: [EnvironmentController],
  providers: [
    EnvironmentService, LogsCerberusService, //MicrocontrollersService
  ],
  exports: [EnvironmentService]
})
export class EnvironmentModule { }
