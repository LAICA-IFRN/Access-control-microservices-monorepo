import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new transports.File({
          filename: 'src/errors/%DATE%.log',
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

  app.setGlobalPrefix('users')

  const config = new DocumentBuilder()
    .setTitle('Serviço de Usuários')
    .setDescription('Descrição do serviço de usuários que faz parte do dominio de usuários do sistema de controle de acesso do Laica')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('users/api', app, document);

  await app.listen(6001);
}
bootstrap();
