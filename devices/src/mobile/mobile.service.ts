import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateMobileDto } from './dto/create-mobile.dto';
import { UpdateMobileDto } from './dto/update-mobile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class MobileService {
  private readonly tokenizationServiceUrl = process.env.TOKENIZATION_SERVICE_URL
  private readonly usersServiceUrl = `${process.env.USERS_SERVICE_URL}`
  private readonly createAuditLogUrl = `${process.env.AUDIT_SERVICE_URL}/logs`
  private readonly errorLogger = new Logger()

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) { }

  async getEnvironments(mac: string, token: string) {
    const findMobileEndpoint = this.tokenizationServiceUrl + `authorize/mobile?token=${token}`
    const data = await lastValueFrom<any>(
      this.httpService.get(findMobileEndpoint).pipe(
        catchError((error) => {
          this.errorLogger.error(error);
          throw new HttpException(error.response.data, error.response.status);
        }),
      )
    ).then((response) => response.data);

    const mobile = await this.prismaService.mobile.findFirst({
      where: {
        mac,
        user_id: data.userId,
        active: true,
      }
    });

    if (!mobile) {
      throw new HttpException('Mobile not found', HttpStatus.NOT_FOUND);
    }


  }
}
