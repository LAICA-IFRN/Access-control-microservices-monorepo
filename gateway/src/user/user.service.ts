import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRoutes } from './user.routes';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    private httpService: HttpService,
    private userRoutes: UserRoutes
  ) {}

  async create(body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.userRoutes.create(), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 409) {
            throw new HttpException(error.response.data.message, HttpStatus.CONFLICT);
          } else if (error.response.data.statusCode === 403) {
            throw new HttpException(error.response.data.message, HttpStatus.FORBIDDEN);
          } else {
            throw new HttpException('Unable to create user', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );  

    return data;
  }

  async findOne(id: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.userRoutes.findOne(id)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException('Unable to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async findAllFrequenters() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.userRoutes.findAllFrequenters()).pipe(
        catchError((error) => {
          console.log(error);
          
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException('Unable to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async findAllAdmins() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.userRoutes.findAllAdmins()).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException('Unable to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async findAllEnvironmentManager() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.userRoutes.findAllEnvironmentManager()).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException('Unable to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async findAllInactive() {
    const { data } = await lastValueFrom(
      this.httpService.get(this.userRoutes.findAllInactive()).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException('Unable to fetch data', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async updateStatus(id: string, status: boolean) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.userRoutes.updateStatus(id), { status }).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException('Unable to update status', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async update(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.userRoutes.update(id), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (error.response.data.statusCode === 404) {
            throw new HttpException(error.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException('Unable to update user', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async createRole(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.userRoutes.createRole(id), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException('Unable to add role', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async findAllRoles(id: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(this.userRoutes.findAllRoles(id)).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException('Unable to fetch roles', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async changeRoleStatus(id: string, roleId: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(this.userRoutes.changeRoleStatus(id, roleId), body).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException('Unable to change role status', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async removeRole(id: string, body: any) {
    const { data } = await lastValueFrom(
      this.httpService.delete(this.userRoutes.removeRole(id), {
        data: body
      }).pipe(
        catchError((error) => {
          if (error.response.data.statusCode === 400) {
            throw new HttpException(error.response.data.message, HttpStatus.BAD_REQUEST);
          } else {
            throw new HttpException('Unable to delete role', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }
}
