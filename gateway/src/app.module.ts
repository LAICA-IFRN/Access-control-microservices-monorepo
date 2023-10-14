import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EnvironmentsModule } from './environments/environments.module';
import { MicrocontrollersModule } from './microcontrollers/microcontrollers.module';
import { DevicesModule } from './devices/devices.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    EnvironmentsModule,
    MicrocontrollersModule,
    DevicesModule,
    AuthModule
  ]
})
export class AppModule {}
