import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Gateway de acesso aos serviços do sistema de controle de acesso do Laica')
    .setVersion('0.1')
    .build();

  app.setGlobalPrefix('gateway');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(8000);
}
bootstrap();
