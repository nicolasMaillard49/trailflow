import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: false,
  });

  // Manual body parsing: raw for webhook, JSON for everything else
  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
  app.use((req: any, _res: any, next: any) => {
    if (req.path === '/api/payments/webhook') return next();
    express.json({ limit: '100kb' })(req, _res, next);
  });
  app.use((req: any, _res: any, next: any) => {
    if (req.path === '/api/payments/webhook') return next();
    express.urlencoded({ extended: true })(req, _res, next);
  });

  app.use(compression());
  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
