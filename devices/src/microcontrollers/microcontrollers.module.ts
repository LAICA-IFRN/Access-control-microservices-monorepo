import { Module } from '@nestjs/common';
import { MicrocontrollersService } from './microcontrollers.service';
import { MicrocontrollersController } from './microcontrollers.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuditLogService } from 'src/audit-log/audit-log.service';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
  ],
  controllers: [MicrocontrollersController],
  providers: [
    MicrocontrollersService,
    AuditLogService
  ],
})
export class MicrocontrollersModule {}
