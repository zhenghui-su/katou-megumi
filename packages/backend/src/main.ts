import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用CORS
  app.enableCors({
    origin: '*', // 开发环境允许所有来源，生产环境应该限制
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API前缀
  app.setGlobalPrefix('api');

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('加藤惠粉丝网站 API')
    .setDescription('加藤惠粉丝网站后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 加藤惠 API 服务器运行在 http://localhost:${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/api/docs`);
}

bootstrap();