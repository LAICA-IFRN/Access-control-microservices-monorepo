import { Controller, Get, Query } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('redirect-register')
  redirectRegister(@Query('id') id: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>laica</title>
        </head>
        <body>
        <script>
            function getTokenFromHash() {
            const hash = window.location.hash.substr(1);
            const hashParams = new URLSearchParams(hash);
            const accessToken = hashParams.get('access_token');
            return accessToken;
            }

            const token = getTokenFromHash();

            window.location.href = '${process.env.REDIRECT_URL}?id=${id}&token='+token;
        </script>
        </body>
        </html>
    `;
  }

  @Get('')
  getHello(): string {
    return 'Hello World!';
  }
}