import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { MicrocontrollersRoutes } from './microcontrollers.routes';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class MicrocontrollersService {
  constructor(
    private httpService: HttpService,
    private microcontrollersRoutes: MicrocontrollersRoutes
  ) {}

  async createEsp32(createEsp32Dto: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(
        this.microcontrollersRoutes.createEsp32(),
        createEsp32Dto
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 409) {
            throw new HttpException(err.response.data.message, HttpStatus.CONFLICT);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async findAllEsp32(skip: number, take: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(
        this.microcontrollersRoutes.findAllEsp32(skip, take)
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
      ))
    );
    
    return data;
  }

  async findOneEsp32(id: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(
        this.microcontrollersRoutes.findOneEsp32(id)
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async findAllEsp32ByEnvironmentId(environmentId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(
        this.microcontrollersRoutes.findAllEsp32ByEnvironmentId(environmentId)
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async updateEsp32(id: number, updateEsp32Dto: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(
        this.microcontrollersRoutes.updateEsp32(id),
        updateEsp32Dto
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else if (err.response.data.statusCode === 409) {
            throw new HttpException(err.response.data.message, HttpStatus.CONFLICT);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async updateStatusEsp32(id: number, updateStatusEsp32Dto: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(
        this.microcontrollersRoutes.updateStatusEsp32(id),
        updateStatusEsp32Dto
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async removeEsp32(id: number) {
    const { data } = await lastValueFrom(
      this.httpService.delete(
        this.microcontrollersRoutes.removeEsp32(id)
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async disconnectEsp8266(id: number) {
    const { data } = await lastValueFrom(
      this.httpService.patch(
        this.microcontrollersRoutes.disconnectEsp8266(id),
        {}
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );

    return data;
  }

  async createEsp8266(createEsp8266Dto: any) {
    const { data } = await lastValueFrom(
      this.httpService.post(
        this.microcontrollersRoutes.createEsp8266(),
        createEsp8266Dto
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 409) {
            throw new HttpException(err.response.data.message, HttpStatus.CONFLICT);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async findAllEsp8266(skip: number, take: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(
        this.microcontrollersRoutes.findAllEsp8266(skip, take)
      )
      .pipe(
        catchError((err) => {
          console.log(err)
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            console.log('oh no')
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
      ))
    );
    
    return data
  }

  async findOneEsp8266(id: number) {
    const { data } = await lastValueFrom(
      this.httpService.get(
        this.microcontrollersRoutes.findOneEsp8266(id)
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST);
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        })
      )
    );
    
    return data;
  }

  async findAllEsp8266ByEnvironmentId(environmentId: string) {
    const { data } = await lastValueFrom(
      this.httpService.get(
        this.microcontrollersRoutes.findAllEsp8266ByEnvironmentId(environmentId)
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST)
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND)
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR)
          }
        })
      )
    );
    
    return data;
  }

  async updateEsp8266(id: number, updateEsp8266Dto: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(
        this.microcontrollersRoutes.updateEsp8266(id),
        updateEsp8266Dto
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST)
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND)
          } else if (err.response.data.statusCode === 409) {
            throw new HttpException(err.response.data.message, HttpStatus.CONFLICT)
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR)
          }
        })
      )
    );
    
    return data;
  }

  async updateStatusEsp8266(id: number, updateStatusEsp8266Dto: any) {
    const { data } = await lastValueFrom(
      this.httpService.patch(
        this.microcontrollersRoutes.updateStatusEsp8266(id),
        updateStatusEsp8266Dto
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 400) {
            throw new HttpException(err.response.data.message, HttpStatus.BAD_REQUEST)
          } else if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND)
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR)
          }
        })
      )
    );
    
    return data;
  }

  async removeEsp8266(id: number) {
    const { data } = await lastValueFrom(
      this.httpService.delete(
        this.microcontrollersRoutes.removeEsp8266(id)
      )
      .pipe(
        catchError((err) => {
          if (err.response.data.statusCode === 404) {
            throw new HttpException(err.response.data.message, HttpStatus.NOT_FOUND)
          } else {
            throw new HttpException(err.response.data.message, HttpStatus.INTERNAL_SERVER_ERROR)
          }
        })
      )
    );
    
    return data;
  }
}
