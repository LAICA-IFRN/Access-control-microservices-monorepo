import { Injectable, NestMiddleware, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnvAccessDto } from '../dto/create-env_access.dto';

@Injectable()
export class EnvAccessConflictMiddleware implements NestMiddleware {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const createEnvAccessDto: CreateEnvAccessDto = req.body;
    const startTime = new Date(
      new Date().toDateString() + ' ' + createEnvAccessDto.startTime
    );
    const endTime = new Date(
      new Date().toDateString() + ' ' + createEnvAccessDto.endTime
    );

    const startPeriod = new Date(createEnvAccessDto.startPeriod);
    const endPeriod = new Date(createEnvAccessDto.endPeriod);
    
    const conflictingEnvAccesses = await this.prisma.envAccess.findMany({
      where: {
        userId: createEnvAccessDto.userId,
        environmentId: createEnvAccessDto.environmentId,
        day: {
          in: createEnvAccessDto.days
        },
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
        NOT: {
          OR: [
            {
              startPeriod: { lt: startPeriod },
              endPeriod: { lt: startPeriod },
            },
            {
              startPeriod: { gt: endPeriod },
              endPeriod: { gt: endPeriod },
            },
          ],
        },

      },
    });
    
    if (conflictingEnvAccesses.length > 0) {
      const days = []
      conflictingEnvAccesses.forEach(conflictAccess => {
        days.push(conflictAccess.day)
      })

      throw new HttpException(
        `days: ${days.join(', ')} - time: ${startTime.toISOString()} at ${endTime.toISOString()} - period: ${startPeriod.toISOString()} at ${endPeriod.toISOString()}`,
        HttpStatus.CONFLICT
      );
    }

    next();
  }
}
