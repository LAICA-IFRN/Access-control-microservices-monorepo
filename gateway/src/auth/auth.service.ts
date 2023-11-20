import { HttpException, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { LoginMobileDto } from './dto/login-mobile.dto';

@Injectable()
export class AuthService {
  private readonly tokenizeUserUrl = process.env.USER_TOKENIZE_URL;
  private readonly tokenizeMobileUrl = process.env.MOBILE_TOKENIZE_URL;
  private readonly tokenizeAccessUrl = process.env.ACCESS_TOKENIZE_URL;

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
          console.log(error);
          
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    )
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        
        throw new HttpException(error.response, error.response.data.statusCode);
      })

    return response;
  }

  async loginEnvironmentUser(body: any, userId: string) {
    const response = await lastValueFrom(
      this.httpService.post(this.tokenizeAccessUrl, { ...body, userId }).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data.message, error.response.data.statusCode);
        })
      )
    )
      .then((response) => response.data)
      .catch((error) => {
        throw new HttpException(error.response, error.status);
      })
    
    return response;
  }
}
