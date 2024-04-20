import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EnvRoutes } from './env.routes';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class EnvironmentsService {
  constructor(
    private httpService: HttpService,
    private envRoutes: EnvRoutes
  ) {}

  async dashboardConsultData() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.dashboardConsultData()).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async create(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.envRoutes.create(), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
    ));

    return data;
  }

  async createTemporaryAccess(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.envRoutes.createTemporaryAccess(), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async requestRemoteAccess(environmentId: string, esp8266Id: number, remoteAccessType: string, userId: string) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.envRoutes.requestRemoteAccess(environmentId, esp8266Id, remoteAccessType, userId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findRemoteAccess(esp8266Id: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findRemoteAccess(esp8266Id)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findOne(id: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findOne(id)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAll(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.envRoutes.findAll(), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async update(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.envRoutes.update(id), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async updateStatus(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.envRoutes.updateStatus(id), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async remove(id: string, userId: string) {
    const { data } = await lastValueFrom(
      this.httpService.delete(this.envRoutes.remove(id, userId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async createManager(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.envRoutes.createManager(), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findOneManager(id: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findOneManager(id)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAllManagers() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAllManager()).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAllManagerByUserId(userId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAllManagerByUserId(userId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAllManagerByEnvironmentId(environmentId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAllManagerByEnvironmentId(environmentId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async searchAccessByUserAndEnv(userId: string, envId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.searchAccessByUserAndEnv(userId, envId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async updateManagerStatus(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.envRoutes.updateManagerStatus(id), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async createAccess(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.envRoutes.createAccess(), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAccessParity(createAccessDto: any) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAccessParity(), {
        data: createAccessDto
      }).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAllAccess() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAllAccess()).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findOneAccess(id: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findOneAccess(id)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAllByFrequenter(frequenterId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAllByFrequenter(frequenterId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAllInactives() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAllInactives()).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async findAllAccessByEnvironmentId(environmentId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.findAllAccessByEnvironmentId(environmentId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async searchManagerByUserAndEnv(userId: string, envId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.envRoutes.searchManagerByUserAndEnv(userId, envId)).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async updateAccessStatus(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.envRoutes.updateAccessStatus(id), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }

  async updateAccess(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.envRoutes.updateAccess(id), body).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    );

    return data;
  }
}
