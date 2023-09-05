import { Module } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { EnvironmentsController } from './environments.controller';
import { HttpModule } from '@nestjs/axios';
import { EnvRoutes } from './env.routes';

@Module({
  imports: [HttpModule],
  controllers: [EnvironmentsController],
  providers: [EnvironmentsService, EnvRoutes]
})
export class EnvironmentsModule {}
