import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { PermissionGuard } from './auth/guards/permission.guard';
import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';

function connectPermissionGuard(app: INestApplication) {
  const reflector = app.get(Reflector);
  const jwt = app.get(JwtService);
  app.useGlobalGuards(new PermissionGuard(jwt, reflector));
}

async function bootstrap() {
  // TODO настроить корс
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  connectPermissionGuard(app);
  await app.listen(3000);
}

bootstrap();
