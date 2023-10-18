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
          
          if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              HttpStatus.BAD_REQUEST,
            );
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              HttpStatus.NOT_FOUND,
            );
          } else if (error.response.data.statusCode === 403) {
            throw new HttpException(
              error.response.data.message,
              HttpStatus.FORBIDDEN,
            );
          } else {
            throw new HttpException(
              'Unable to access',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }),
      ),
    );

    return data;
  }
}
