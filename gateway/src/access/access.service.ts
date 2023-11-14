import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class AccessService {
  private readonly accessUrl = process.env.ACCESS_SERVICE_URL;

  constructor(private readonly httpService: HttpService) {}

  async accessByEsp(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(`${this.accessUrl}/esp`, body).pipe(
        catchError((error) => {
          throw new HttpException(
            error.response.data.message,
            error.response.data.statusCode,
          );
        }),
      ),
    );

    return data;
  }

  async accessByMobile(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(`${this.accessUrl}/mobile`, body).pipe(
        catchError((error) => {
          throw new HttpException(
            error.response.data.message,
            error.response.data.statusCode,
          );
        }),
      ),
    );

    return data;
  }
}
