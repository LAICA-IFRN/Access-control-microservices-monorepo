import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AuditLogService } from 'src/providers/audit-log/audit-log.service';
import { EmailService } from 'src/providers/mail-sender/mail-provider.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [UserController],
  providers: [UserService, AuditLogService, EmailService]
})
export class UserModule {}
