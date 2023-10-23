import { HttpException, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { LoginMobileDto } from './dto/login-mobile.dto';

@Injectable()
export class AuthService {
  private readonly tokenizeUserUrl = process.env.TOKENIZATION_SERVICE_URL + '/tokenize/user';
  private readonly tokenizeMobileUrl = process.env.TOKENIZATION_SERVICE_URL + '/tokenize/mobile';

  constructor(
    private readonly httpService: HttpService,
  ) { }

  async loginUser(loginUserDto: LoginUserDto) {
    const response = await lastValueFrom(
      this.httpService.post(this.tokenizeUserUrl, loginUserDto).pipe(
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

  async loginMobile(loginMobileDto: LoginMobileDto) {
    const response = await lastValueFrom(
      this.httpService.post(this.tokenizeMobileUrl, loginMobileDto).pipe(
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
