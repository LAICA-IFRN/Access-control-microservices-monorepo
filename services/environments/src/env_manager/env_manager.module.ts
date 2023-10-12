import { Module } from '@nestjs/common';
import { EnvManagerService } from './env_manager.service';
import { EnvManagerController } from './env_manager.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PrismaModule,
    HttpModule
  ],
  controllers: [EnvManagerController],
  providers: [EnvManagerService],
})
export class EnvManagerModule {}
