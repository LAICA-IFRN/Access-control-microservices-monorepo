import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateMobileDto } from './dto/create-mobile.dto';
import { UpdateMobileDto } from './dto/update-mobile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { mobile } from '@prisma/client';
import { FindAllDto } from 'src/utils/find-all.dto';

@Injectable()
export class MobileService {
  private readonly tokenizationServiceUrl = process.env.TOKENIZATION_SERVICE_URL
  private readonly environmentsServiceUrl = process.env.ENVIRONMENTS_SERVICE_URL
  private readonly getUserRolesUrl = `${process.env.USERS_SERVICE_URL}/roles`
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

  // async getEnvironments(id: number, userId: string) {
  //   const mobile = await this.prismaService.mobile.findFirst({
  //     where: {
  //       id,
  //       user_id: userId,
  //       active: true,
  //     }
  //   });

  //   if (!mobile) {
  //     throw new HttpException('Mobile not found', HttpStatus.NOT_FOUND);
  //   }

  //   const environments = await lastValueFrom(
  //     this.httpService.get(this.environmentsServiceUrl + '/env-access/user/' + userId).pipe(
  //       catchError((error) => {
  //         console.log(error);
          
  //         this.errorLogger.error(error);
  //         throw new HttpException(error.response.data.message, error.response.data.statusCode);
  //       })
  //     )
  //   ).then((response) => response.data);

  //   return environments;
  // }

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

    const roles: string[] = await lastValueFrom(
      this.httpService.get(`${this.getUserRolesUrl}/${userId}/all`).pipe(
        catchError((error) => {
          console.log(error);
          
          this.errorLogger.error(error);
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    ).then((response) => response.data.roles);

    const roleKeys: number[] = [];
    if (roles.includes('ADMIN')) {
      roleKeys.push(1);
    }
    if (roles.includes('FREQUENTER')) {
      roleKeys.push(2);
    }
    if (roles.includes('ENVIRONMENT_MANAGER')) {
      roleKeys.push(3);
    }

    const environments = await lastValueFrom(
      this.httpService.get(this.environmentsServiceUrl + '/env/mobile', {
        data: {
          roleKeys,
          userId
        }
      }).pipe(
        catchError((error) => {
          console.log(error.response.data.message);
          
          this.errorLogger.error(error);
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    ).then((response) => response.data);

    return {
      environments
    };
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

  async findAll(findAllDto: FindAllDto) {
    const previousLenght = findAllDto.previous * findAllDto.pageSize;
    const nextLenght = findAllDto.pageSize;
    const order = findAllDto.orderBy ? findAllDto.orderBy : {};
    const filter = findAllDto.where ? findAllDto.where : {};

    try {
      const [mobiles, total] = await this.prismaService.$transaction([
        this.prismaService.mobile.findMany({
          skip: previousLenght,
          take: nextLenght,
          orderBy: order,
          where: filter,
        }),
        
        this.prismaService.mobile.count({
          where: filter
        })
      ])

      return {
        pageSize: findAllDto.pageSize,
        previous: findAllDto.previous,
        next: findAllDto.next,
        total,
        data: mobiles
      };
    } catch (error) {}
  }
}
