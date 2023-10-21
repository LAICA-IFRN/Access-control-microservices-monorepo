import { Module } from '@nestjs/common';
import { RfidService } from './rfid.service';
import { RfidController } from './rfid.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, 
    HttpModule,
  ],
  controllers: [RfidController],
  providers: [RfidService],
})
export class RfidModule {}
