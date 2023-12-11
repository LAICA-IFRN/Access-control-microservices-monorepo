import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AccessLogService } from 'src/logs/access-log.service';
import { AuditLogService } from 'src/logs/audit-log.service';

@Module({
  imports: [
    PrismaModule, 
    HttpModule,
  ],
  controllers: [EnvironmentController],
  providers: [EnvironmentService, AccessLogService, AuditLogService],
})
export class EnvironmentModule {}
