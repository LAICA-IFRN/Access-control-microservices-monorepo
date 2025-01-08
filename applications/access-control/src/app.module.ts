import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RfidModule } from './rfid/rfid.module';
import { MicrocontrollersModule } from './microcontrollers/microcontrollers.module';
import { HttpModule } from '@nestjs/axios';
import { EnvironmentModule } from './environment/environment.module';
import { EnvAccessModule } from './env_access/env_access.module';
import { EnvManagerModule } from './env_manager/env_manager.module';
import { AccessModule } from './access/access.module';
import { MobileModule } from './mobile/mobile.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    RfidModule,
    MicrocontrollersModule,
    HttpModule,
    EnvironmentModule,
    EnvAccessModule,
    EnvManagerModule,
    AccessModule,
    MobileModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
      max: 100000,
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
