import { Module } from '@nestjs/common';
import { AppController } from './access.controller';
import { AccessService } from './access.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LogsCerberusService } from 'src/logs/logs.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AccessService, LogsCerberusService],
})
export class AccessModule { }
