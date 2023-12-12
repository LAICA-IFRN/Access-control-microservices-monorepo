import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RfidModule } from './rfid/rfid.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MicrocontrollersModule } from './microcontrollers/microcontrollers.module';
import { HttpModule } from '@nestjs/axios';
import { MobileModule } from './mobile/mobile.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule, 
    RfidModule,
    MicrocontrollersModule,
    HttpModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
      max: 100000,
    }),
    MobileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
