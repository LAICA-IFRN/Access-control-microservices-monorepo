import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { DeviceRoutes } from './devices.routes';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class DevicesService {

  constructor(
    private readonly httpService: HttpService,
    private readonly deviceRoutes: DeviceRoutes,
  ) {}

  async createRfid(body: any) {
    const response = await lastValueFrom(
      this.httpService.post(this.deviceRoutes.createRfid(), body).pipe(
        catchError((error) => {
          if (error.response?.data?.statusCode === 404) {
            throw new HttpException(
              error.response?.data?.message,
              error.response?.data?.statusCode,
            );
          } else if (error.response?.data?.statusCode === 400) {
            throw new HttpException(
              error.response?.data?.message,
              error.response?.data?.statusCode,
            );
          } else if (error.response?.data?.statusCode === 409) {
            throw new HttpException(
              error.response?.data?.message,
              error.response?.data?.statusCode,
            );
          } else {
            throw new HttpException(
              error.response?.data?.message,
              error.response?.data?.statusCode,
            );
          }
        })
      )
    );
    
    return response.data;
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

  async createMicrocontroller(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.deviceRoutes.createMicrocontroller(), body).pipe(
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

  async activeMicrocontroller(id: number, environmentId: string) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.deviceRoutes.activeMicrocontroller(id, environmentId)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
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

  async keepAliveMicrocontroller(id: number, healthCode: number, doorStatus: boolean) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.deviceRoutes.keepAliveMicrocontroller(id, healthCode, doorStatus)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
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

  async getMicrocontrollerInfo(id: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.deviceRoutes.getMicrocontrollerInfo(id)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
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

  async findOneMicrocontroller(id: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.deviceRoutes.findOneMicrocontroller(id)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
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

  async findAllMicrocontroller(skip: number, take: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.deviceRoutes.findAllMicrocontroller(skip, take)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
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

  async findAllMicrocontrollersInactives(skip: number, take: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.deviceRoutes.findAllMicrocontrollersInactives(skip, take)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
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

  async findAllMicrocontrollersByEnvironmentId(environmentId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.deviceRoutes.findAllMicrocontrollersByEnvironmentId(environmentId)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
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

  async updateMicrocontroller(id: number, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.deviceRoutes.updateMicrocontroller(id), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            )
          } else if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            )
          } else {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode,
            )
          }
        })
      )
    );

    return data;
  }

  async updateMicrocontrollerStatus(id: number, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.deviceRoutes.updateMicrocontrollerStatus(id), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 404) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode
            )
          } else if (error.response.data.statusCode === 400) {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode
            )
          } else {
            throw new HttpException(
              error.response.data.message,
              error.response.data.statusCode
            )
          }
        })
      )
    );

    return data;
  }
}
