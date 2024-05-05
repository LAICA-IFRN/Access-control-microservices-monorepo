import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import { HttpModule } from '@nestjs/axios';
import { LoggerRoutes } from './logger.routes';

@Module({
  imports: [HttpModule],
  controllers: [LoggerController],
  providers: [LoggerService, LoggerRoutes]
})
export class LoggerModule { }
