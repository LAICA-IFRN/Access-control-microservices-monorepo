import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RfidModule } from './rfid/rfid.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MicrocontrollersModule } from './microcontrollers/microcontrollers.module';

@Module({
  imports: [
    PrismaModule, 
    RfidModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
      max: 100000,
    }),
    MicrocontrollersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
