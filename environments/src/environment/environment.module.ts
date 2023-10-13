import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PrismaModule, 
    HttpModule,
  ],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
})
export class EnvironmentModule {}
