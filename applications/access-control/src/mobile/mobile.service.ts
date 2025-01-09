import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { mobile } from '@prisma/client';
import { FindAllDto } from 'src/utils/find-all.dto';
import { EnvironmentService } from 'src/environment/environment.service';

@Injectable()
export class MobileService {
  private readonly environmentsServiceUrl = process.env.ENVIRONMENTS_SERVICE_URL
  private readonly getUserRolesUrl = `${process.env.USERS_SERVICE_URL}/roles`
  private readonly createAuditLogUrl = `${process.env.AUDIT_LOG_URL}`
  private readonly errorLogger = new Logger()

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly environmentsService: EnvironmentService,
  ) { }

  async create(userId: string) {
    let mobile: mobile;

    mobile = await this.prismaService.mobile.findFirst({
      where: {
        user_id: userId,
        active: true,
      }
    });

    if (mobile) {
      await this.prismaService.mobile.update({
        where: {
          id: mobile.id
        },
        data: {
          active: false
        }
      });

      this.sendLogWhenMobileDeactivated(userId, mobile);
    }

    const user = await this.getUserData(userId);

    try {
      mobile = await this.prismaService.mobile.create({
        data: {
          user_id: userId,
          user_name: user.name,
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('Mobile already exists', HttpStatus.CONFLICT);
      } else {
        throw new HttpException("Can't create mobile", HttpStatus.UNPROCESSABLE_ENTITY)
      }
    }

    if (mobile) {
      this.sendLogWhenMobileCreated(userId, mobile);
    }

    return {
      id: mobile.id
    };
  }

  async sendLogWhenMobileCreated(userId: string, mobile: mobile) {
    const userData = await this.getUserData(userId);

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: "Dispositivos",
        type: "Info",
        message: `Dispositivo móvel ${mobile.id} criado para o usuário ${userData.name}`,
        meta: {
          userId,
          mobileId: mobile.id
        }
      })
    )
      .then(() => { })
      .catch((error) => {
        this.errorLogger.error("Falha ao criar log de auditoria", error);
      });
  }

  async sendLogWhenMobileDeactivated(userId: string, mobile: mobile) {
    const userData = await this.getUserData(userId);

    await lastValueFrom(
      this.httpService.post(this.createAuditLogUrl, {
        topic: "Dispositivos",
        type: "Info",
        message: `Dispositivo móvel ${mobile.id} do usuário ${userData.name} desativado`,
        meta: {
          userId,
          mobileId: mobile.id
        }
      })
    )
      .then(() => { })
      .catch((error) => {
        this.errorLogger.error("Falha ao criar log de auditoria", error);
      });
  }

  async getUserData(userId: string) {
    const userData = await lastValueFrom(
      this.httpService.get(`${process.env.USERS_SERVICE_URL}/${userId}`).pipe(
        catchError(async (error) => {
          this.errorLogger.error("Falha ao buscar dados do usuário", error);
          await lastValueFrom(
            this.httpService.post(this.createAuditLogUrl, {
              topic: "Dispositivos",
              type: "Error",
              message: "Falha ao buscar dados do usuário durante criação de log de auditoria",
              meta: {
                userId,
                error: error
              }
            })
          ).then(() => { });
        })
      )
    ).then((response: any) => response.data);

    return userData;
  }

  async findOne(id: string) {
    const mobile = await this.prismaService.mobile.findFirst({
      where: {
        id
      }
    });

    return mobile;
  }

  async hasMobile(userId: string) {
    const mobile = await this.prismaService.mobile.findFirst({
      where: {
        user_id: userId,
        active: true,
      }
    });

    return {
      hasMobile: !!mobile,
      mobileId: mobile?.id
    };
  }

  async getEnvironments(id: string, userId: string) {
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

    const environments = await this.environmentsService.getEnvironmentForMobile({
      roleKeys,
      userId
    })

    return {
      environments
    };
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
    } catch (error) { }
  }
}
