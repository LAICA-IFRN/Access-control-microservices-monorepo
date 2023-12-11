import { Module } from '@nestjs/common';
import { EnvManagerService } from './env_manager.service';
import { EnvManagerController } from './env_manager.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AuditLogService } from 'src/logs/audit-log.service';

@Module({
  imports: [
    PrismaModule,
    HttpModule
  ],
  controllers: [EnvManagerController],
  providers: [EnvManagerService, AuditLogService],
})
export class EnvManagerModule {}
