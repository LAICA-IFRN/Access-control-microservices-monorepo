import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EnvironmentModule } from './environment/environment.module';
import { EnvManagerModule } from './env_manager/env_manager.module';
import { EnvAccessModule } from './env_access/env_access.module';
import * as cors from 'cors';

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