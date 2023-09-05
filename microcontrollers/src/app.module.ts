import { Module } from '@nestjs/common';
import { Esp32Module } from './esp32/esp32.module';
import { PrismaModule } from './prisma/prisma.module';
import { Esp8266Module } from './esp8266/esp8266.module';

@Module({
  imports: [Esp32Module, PrismaModule, Esp8266Module],
  controllers: [],
  providers: [],
})
export class AppModule {}
