import { HttpException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly tokenizeUrl = process.env.TOKENIZATION_SERVICE_URL + '/tokenize';

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async login(loginDto: LoginDto) {
    const response = await lastValueFrom(
      this.httpService.post(this.tokenizeUrl, loginDto).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    )
    .then((response) => response.data)
    .catch((error) => {
      throw new HttpException(error.response, error.response.data.statusCode);
    })

    return response;
  }
}
