import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EnvironmentModule } from './environment/environment.module';
import { EnvManagerModule } from './env_manager/env_manager.module';
import { EnvAccessModule } from './env_access/env_access.module';

@Module({
  imports: [
    PrismaModule, 
    EnvironmentModule, 
    EnvManagerModule, 
    EnvAccessModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
