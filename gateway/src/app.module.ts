import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EnvironmentsModule } from './environments/environments.module';
import { MicrocontrollersModule } from './microcontrollers/microcontrollers.module';

@Module({
  imports: [
    UserModule,
    EnvironmentsModule,
    MicrocontrollersModule
  ]
})
export class AppModule {}
