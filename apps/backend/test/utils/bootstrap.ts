import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

/** Boots a full Nest application (real Postgres, per DATABASE_URL) for e2e tests. */
export async function bootstrapTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();

  app.use(cookieParser(process.env.CART_COOKIE_SECRET ?? 'test-secret'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  await app.init();
  return app;
}

/** A short random suffix so repeated test runs never collide on unique fields. */
export function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}
