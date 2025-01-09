import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { EnvironmentService } from 'src/environment/environment.service';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
  ],
  controllers: [MobileController],
  providers: [
    MobileService,
    EnvironmentService,
  ],
})
export class MobileModule { }
