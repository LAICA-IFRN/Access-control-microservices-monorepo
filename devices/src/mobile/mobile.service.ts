import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateMobileDto } from './dto/create-mobile.dto';
import { UpdateMobileDto } from './dto/update-mobile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { mobile } from '@prisma/client';

@Injectable()
export class MobileService {
  private readonly tokenizationServiceUrl = process.env.TOKENIZATION_SERVICE_URL
  private readonly environmentsServiceUrl = process.env.ENVIRONMENTS_SERVICE_URL
  private readonly usersServiceUrl = `${process.env.USERS_SERVICE_URL}`
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly errorLogger = new Logger()

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) { }

  async create(createMobileDto: CreateMobileDto, userId: string) {
    let mobile: mobile;
    try {
      mobile = await this.prismaService.mobile.create({
        data: {
          ...createMobileDto,
          user_id: userId,
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('Mobile already exists', HttpStatus.CONFLICT);
      } else {
        throw new HttpException("Can't create mobile", HttpStatus.UNPROCESSABLE_ENTITY)
      }
    }

    return mobile.id;
  }

  async getEnvironments(id: number, userId: string) {
    const mobile = await this.prismaService.mobile.findFirst({
      where: {
        id,
        user_id: userId,
        active: true,
      }
    });

    if (!mobile) {
      throw new HttpException('Mobile not found', HttpStatus.NOT_FOUND);
    }

    const environments = await lastValueFrom(
      this.httpService.get(this.environmentsServiceUrl + '/env-access/user/' + userId).pipe(
        catchError((error) => {
          console.log(error);
          
          this.errorLogger.error(error);
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    ).then((response) => response.data);

    return environments;
  }

  async getByMac(mac: string) {
    const mobile = await this.prismaService.mobile.findFirst({
      where: {
        mac,
        active: true,
      }
    });

    return mobile;
  }
}
