import { Module } from '@nestjs/common';
import { Esp8266Service } from './esp8266.service';
import { Esp8266Controller } from './esp8266.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [Esp8266Controller],
  providers: [Esp8266Service],
})
export class Esp8266Module {}
