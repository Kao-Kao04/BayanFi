import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Structured logging
  app.useLogger(app.get(Logger));

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.APP_URL?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // API prefix: all routes served under /v1 (health checks excluded).
  app.setGlobalPrefix('v1', { exclude: ['health', 'health/ready'] });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // Global response envelope + error handling
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('BayanFi API')
    .setDescription('Transparent Public Money. Powered by Stellar.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('organizations')
    .addTag('programs')
    .addTag('applications')
    .addTag('wallets')
    .addTag('transactions')
    .addTag('merchants')
    .addTag('ai')
    .addTag('transparency')
    .addTag('audit')
    .addTag('disaster')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`BayanFi API running on http://localhost:${port}`);
}

bootstrap();
