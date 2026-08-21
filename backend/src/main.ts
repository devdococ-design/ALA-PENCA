import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { getJwtSecret } from './auth/jwt-secret';

function applySecurityHeaders(app: NestExpressApplication): void {
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
  });
}

function resolveCorsOrigin(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (raw) {
    const list = raw.split(',').map((v) => v.trim()).filter(Boolean);
    return list.length === 1 ? list[0] : list;
  }
  // Development: allow local frontends. Production with reverse-proxy (/api): same-origin is enough.
  return process.env.NODE_ENV === 'production' ? false : true;
}

async function bootstrap() {
  getJwtSecret();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) mkdirSync(uploadsPath, { recursive: true });

  applySecurityHeaders(app);

  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });
  app.enableCors({
    origin: resolveCorsOrigin(),
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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
