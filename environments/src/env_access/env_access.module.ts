import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { EnvAccessService } from './env_access.service';
import { EnvAccessController } from './env_access.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EnvAccessConflictMiddleware } from './middlewares/env-access-conflict.middleware';

@Module({
  imports: [
    PrismaModule,
    HttpModule
  ],
  controllers: [EnvAccessController],
  providers: [EnvAccessService, EnvAccessConflictMiddleware],
})
//export class EnvAccessModule {}
export class EnvAccessModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
      .apply(EnvAccessConflictMiddleware)
      .exclude({ path: 'env-access/parity', method: RequestMethod.POST })
      .forRoutes({ path: 'env-access', method: RequestMethod.POST });
  }
}
