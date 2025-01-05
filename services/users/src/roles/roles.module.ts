import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AuditLogService } from 'src/providers/audit-log/audit-log.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [RolesController],
  providers: [RolesService, AuditLogService]
})
export class RolesModule {}
