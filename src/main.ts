import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get('SERVER_PORT');
  const SWAGGER_USER = configService.get('SWAGGER_USER');
  const SWAGGER_PASSWORD = configService.get('SWAGGER_PASSWORD');

  // Swagger 문서에 비밀번호 걸기 위한 NPM
  // npm install express-basic-auth
  app.use(
    ['/docs', '/docs-json'],
    expressBasicAuth({
      challenge: true,
      users: { [SWAGGER_USER]: SWAGGER_PASSWORD },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('SNS API SERVER')
    .setDescription('소셜 네트워크 서비스 API 서버 스웨거 문서입니다.')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    // 하단 Schema Models 제거 옵션
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  // Global Pipe
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT);
  Logger.log(`Application running on port ${PORT}, http://localhost:${PORT}`);
  Logger.log(`Go to API Docs : http://localhost:${PORT}/docs`);
}

bootstrap();
