import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
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
        }),
      ],
    }),
  });

  app.setGlobalPrefix('service/users')

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Serviço de Usuários')
    .setDescription('Documentação do serviço de usuários do Laica Cerberus')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('service/users/api', app, document);

  app.enableCors({
    origin: [
      process.env.ALLOWED_GATEWAY_ORIGIN,
      process.env.ALLOWED_ENVIRONMENTS_ORIGIN,
      process.env.ALLOWED_ACCESS_ORIGIN,
      process.env.ALLOWED_DEVICES_ORIGIN,
    ],
    methods: process.env.ALLOWED_METHODS,
    credentials: true,
  });

  await app.listen(6001);
}
bootstrap();
