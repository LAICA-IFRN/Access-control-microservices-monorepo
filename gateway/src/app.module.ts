import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EnvironmentsModule } from './environments/environments.module';
import { DevicesModule } from './devices/devices.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AccessModule } from './access/access.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    EnvironmentsModule,
    DevicesModule,
    AuthModule,
    AccessModule,
    LogsModule
  ]
})
export class AppModule {}
