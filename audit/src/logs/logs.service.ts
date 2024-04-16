import { Injectable, Logger } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllDto } from 'src/utils/find-all.dto';
import { log } from '@prisma/client';

@Injectable()
export class LogsService {
  errorLogger = new Logger()

  constructor(private readonly prismaService: PrismaService) {}

  async create(createLogDto: CreateLogDto) {
    const meta = JSON.stringify(createLogDto.meta)
    
    try {
      const log = await this.prismaService.log.create({
        data: {
          type: createLogDto.type,
          message: createLogDto.message,
          topic: createLogDto.topic,
          meta
        }
      });

      return log;
    } catch (error) {
      console.log(error);
      
      this.errorLogger.error('Falha ao criar log', error.meta);
    }
  }

  async findAll(findAllDto: FindAllDto) {
    console.log(findAllDto);
    
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const order = findAllDto.orderBy ? findAllDto.orderBy : {};
    const filter = findAllDto.where ? findAllDto.where : {};

    try {
      let data: log[];

      data = await this.prismaService.log.findMany({
        skip: previousLenght,
        take: nextLenght,
        orderBy: order,
        where: filter,
      });

      const total = await this.prismaService.log.count({
        where: filter,
      });

      return {
        pageSize: findAllDto.pageSize,
        previous: findAllDto.previous,
        next: findAllDto.next,
        total,
        data
      };
    } catch (error) {
      console.log(error);
      
      this.errorLogger.error('Falha ao criar log', error.meta);
    }
  }
}
