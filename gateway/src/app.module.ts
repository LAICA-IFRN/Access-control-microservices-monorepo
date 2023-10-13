import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EnvironmentsModule } from './environments/environments.module';
import { MicrocontrollersModule } from './microcontrollers/microcontrollers.module';
import { DevicesModule } from './devices/devices.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    EnvironmentsModule,
    MicrocontrollersModule,
    DevicesModule
  ]
})
export class AppModule {}
