import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeviceRoutes } from './devices.routes';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class DevicesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly deviceRoutes: DeviceRoutes,
  ) {}

  async createRfid(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.deviceRoutes.createRfid(), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else if (error.response.data.statusCode === 409) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          }
        })
      )
    );

    return data;
  }

  async findOneRfid(id: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.deviceRoutes.findOneRfid(id)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          }
        })
      )
    );

    return data;
  }

  async findAllRfid(skip: number, take: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.deviceRoutes.findAllRfid(skip, take)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          }
        })
      )
    );

    return data;
  }

  async updateRfidStatus(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.deviceRoutes.updateRfidStatus(id), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          }
        })
      )
    );

    return data;
  }

  async removeRfid(id: string) {
    const { data } = await lastValueFrom(
      this.httpService.delete(this.deviceRoutes.removeRfid(id)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          } else {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            );
          }
        })
      )
    );

    return data;
  }
}
