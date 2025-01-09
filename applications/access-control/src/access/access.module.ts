import { Module } from '@nestjs/common';
import { AppController } from './access.controller';
import { AccessService } from './access.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LogsCerberusService } from 'src/logs/logs.service';
import { UtilsProvider } from './providers/utils.provider';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AccessService, LogsCerberusService, UtilsProvider],
})
export class AccessModule { }
