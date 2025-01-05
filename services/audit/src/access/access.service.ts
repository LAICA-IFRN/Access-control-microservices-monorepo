import { Injectable, Logger } from '@nestjs/common';
import { CreateAccessDto } from './dto/create-access.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllDto } from '../utils/find-all.dto';
import { access } from '@prisma/client';

@Injectable()
export class AccessService {
  errorLogger = new Logger()

  constructor(private readonly prismaService: PrismaService) {}

  async create(createAccessDto: CreateAccessDto) {
    const meta = JSON.stringify(createAccessDto.meta);

    try {
      return await this.prismaService.access.create({
        data: {
          type: createAccessDto.type,
          message: createAccessDto.message,
          meta
        }
      });
    } catch (error) {
      this.errorLogger.error('Falha ao criar log', error.meta);
    }
  }

  async findAll(findAllDto: FindAllDto) {
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const order = findAllDto.orderBy ? findAllDto.orderBy : {created_at: 'asc'};
    const filter = findAllDto.where ? findAllDto.where : {};

    try {
      let data: access[];

      data = await this.prismaService.access.findMany({
        skip: previousLenght,
        take: nextLenght,
        orderBy: order,
        where: filter,
      });

      const total = await this.prismaService.access.count({
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
      this.errorLogger.error('Falha ao criar log', error.meta);
    }
  }
}
