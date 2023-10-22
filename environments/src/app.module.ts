import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EnvironmentModule } from './environment/environment.module';
import { EnvManagerModule } from './env_manager/env_manager.module';
import { EnvAccessModule } from './env_access/env_access.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule, 
    EnvironmentModule, 
    EnvManagerModule, 
    EnvAccessModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
      max: 100000,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
