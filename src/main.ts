import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { PermissionGuard } from './auth/guards/permission.guard';
import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import { UserService } from './user/user.service';
import * as cookieParser from 'cookie-parser';
import * as process from 'node:process';
import { join } from 'path';
import * as express from 'express';

function connectGuards(app: INestApplication) {
  const reflector = app.get(Reflector);
  const jwt = app.get(JwtService);
  const user = app.get(UserService);
  app.useGlobalGuards(new PermissionGuard(jwt, reflector, user));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  connectGuards(app);
  app.enableCors({
    // origin: process.env.FRONT_URL || '*',
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
    ],
    exposedHeaders: ['Authorization'],
  });
  app.use(cookieParser());
  app.use('/static', express.static(join(__dirname, '..', 'public')));
  const port = process.env.PORT || 5000;
  console.log('Server has been start on port:', port);
  await app.listen(port);
}

bootstrap();
