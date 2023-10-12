import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    UserModule, 
    PrismaModule, 
    RolesModule
  ],
  providers: []
})
export class AppModule {}
