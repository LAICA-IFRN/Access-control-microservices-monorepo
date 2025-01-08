import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {

  constructor(private readonly prismaService: PrismaService) { }

  async dashboardConsultDevicesData() {
    const microcontrollersCount = await this.prismaService.microcontroller.count();
    const microcontrollersCreatedAtLastWeekCount = await this.prismaService.microcontroller.count({
      where: {
        created_at: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    const mobilesCount = await this.prismaService.mobile.count();
    const mobilesCreatedAtLastWeekCount = await this.prismaService.mobile.count({
      where: {
        created_at: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    const rfidCount = await this.prismaService.tag_rfid.count();
    const rfidCreatedAtLastWeekCount = await this.prismaService.tag_rfid.count({
      where: {
        created_at: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    return {
      totalDevices: microcontrollersCount + mobilesCount + rfidCount,
      devicesCreatedAtLastWeek: microcontrollersCreatedAtLastWeekCount + mobilesCreatedAtLastWeekCount + rfidCreatedAtLastWeekCount
    }
  }
}
