import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  app.use(helmet());
  app.use(cookieParser(config.get<string>('CART_COOKIE_SECRET')));

  const corsOrigins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EA Computers API')
    .setDescription(
      'REST API powering the EA Computers storefront and admin dashboard — ' +
        'products, categories, brands, cart, checkout, orders and authentication.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addTag('auth', 'Registration, login and the current session')
    .addTag('products', 'Product catalog, search and filtering')
    .addTag('categories', 'Hardware categories (hierarchical)')
    .addTag('brands', 'Hardware brands')
    .addTag('cart', 'Guest & authenticated shopping cart')
    .addTag('checkout', 'Server-authoritative checkout')
    .addTag('orders', 'Customer order history')
    .addTag('admin', 'Admin-only management endpoints')
    .addTag('uploads', 'Image upload infrastructure')
    .addTag('health', 'Service health checks')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`EA Computers API listening on http://localhost:${port}/${apiPrefix}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
}
bootstrap();
