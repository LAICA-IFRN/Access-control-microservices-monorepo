import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

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
    })
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  app.setGlobalPrefix('service/microcontrollers');

  const config = new DocumentBuilder()
  .setTitle('Serviço de Microcontroladores')
  .setDescription('Documentação do serviço de microcontroladores do sistema de controle de acesso do Laica')
  .setVersion('0.1')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('service/microcontrollers/api', app, document);

  app.enableCors({
    origin: [
      process.env.ALLOWED_GATEWAY_ORIGIN,
      process.env.ALLOWED_ENVIRONMENTS_ORIGIN,
      process.env.ALLOWED_ACCESS_ORIGIN
    ],
    methods: process.env.ALLOWED_METHODS,
    credentials: true,
  });

  await app.listen(6003);
}
bootstrap();
