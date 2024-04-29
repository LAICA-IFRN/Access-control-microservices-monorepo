import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): string {
    console.log('Health check');

    return 'OK';
  }

  throwErr() {
    console.error('Deu merda');
    return new HttpException('Error', 500);
  }
}
