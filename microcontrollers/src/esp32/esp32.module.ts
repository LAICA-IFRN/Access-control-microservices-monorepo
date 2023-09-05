import { Module } from '@nestjs/common';
import { Esp32Service } from './esp32.service';
import { Esp32Controller } from './esp32.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [Esp32Controller],
  providers: [Esp32Service],
})
export class Esp32Module {}
