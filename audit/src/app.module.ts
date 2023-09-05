import { Module } from '@nestjs/common';
import { LogsModule } from './logs/logs.module';
import { PrismaModule } from './prisma/prisma.module';
@Module({
  imports: [LogsModule, PrismaModule],
})
export class AppModule {}
