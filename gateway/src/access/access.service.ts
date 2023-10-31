import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class AccessService {
  private readonly accessUrl = process.env.ACCESS_SERVICE_URL;

  constructor(private readonly httpService: HttpService) {}

  async access(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(`${this.accessUrl}`, body).pipe(
        catchError((error) => {
          console.log(error);
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
