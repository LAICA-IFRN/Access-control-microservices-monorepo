import { Module } from '@nestjs/common';
import { LogsModule } from './logs/logs.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccessModule } from './access/access.module';
@Module({
  imports: [LogsModule, PrismaModule, AccessModule],
})
export class AppModule {}
