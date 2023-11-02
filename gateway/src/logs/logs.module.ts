import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { HttpModule } from '@nestjs/axios';
import { LogsRoutes } from './logs.routes';

@Module({
  imports: [HttpModule],
  controllers: [LogsController],
  providers: [LogsService, LogsRoutes]
})
export class LogsModule {}
