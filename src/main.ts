import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new transports.File({
          filename: 'src/errors/json.log',
          format: format.combine(format.timestamp(), format.json()),
          zippedArchive: false,
          maxFiles: 30,
          level: 'error',
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
          ),
        })
      ]
    }),
    cors: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  //app.setGlobalPrefix('access-ng')
  const config = new DocumentBuilder()
    .setTitle('Laica: Controle de acesso')
    .setDescription('Documentação da api do sistema de controle de acesso do Laica.')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  //app.setGlobalPrefix('')

  await app.listen(8000);
}
bootstrap();
