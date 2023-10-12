import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RfidModule } from './rfid/rfid.module';

@Module({
  imports: [PrismaModule, RfidModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
