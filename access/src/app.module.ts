import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AccessLogService } from './providers/audit-log/audit-log.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService, AccessLogService],
})
export class AppModule {}
