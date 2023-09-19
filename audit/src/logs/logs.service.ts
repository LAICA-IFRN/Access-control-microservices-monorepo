import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Http } from 'winston/lib/winston/transports';

@Injectable()
export class LogsService {
  errorLogger = new Logger()

  constructor(private readonly prisma: PrismaService) {}

  async create(createLogDto: CreateLogDto) {
    try {
      const log = await this.prisma.log.create({
        data: createLogDto
      });

      console.log(log)

      return log;
    } catch (error) {
      this.errorLogger.error('Falha ao criar log', error.meta)
    }
  }

  async search(type: string, topic: string, skip: number, take: number) {
    if (isNaN(skip) || isNaN(take)) {
      throw new HttpException('Invalid skip or take', HttpStatus.BAD_REQUEST)
    }

    try {
      const [logs, count] = await this.prisma.$transaction([
        this.prisma.log.findMany({
          where: {
            type,
            topic
          },
          skip,
          take
        }),
  
        this.prisma.log.count({
          where: {
            type,
            topic
          }
        })
      ])
  
      const pages = Math.ceil(count / take)
  
      return {
        logs,
        count,
        pages
      }
    } catch (error) {
      this.errorLogger.error('Falha retornar log', error)
    }
  }
}
