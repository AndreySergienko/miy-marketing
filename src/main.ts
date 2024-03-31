import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { PermissionGuard } from './auth/guards/permission.guard';
import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import { UserService } from './user/user.service';

// import { BanGuard } from './user/guards/ban.guard';

function connectGuards(app: INestApplication) {
  const reflector = app.get(Reflector);
  const jwt = app.get(JwtService);
  const user = app.get(UserService);
  app.useGlobalGuards(new PermissionGuard(jwt, reflector, user));
  // app.useGlobalGuards(new BanGuard(jwt));
}

async function bootstrap() {
  // TODO настроить корс
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  connectGuards(app);
  await app.listen(3000);
}

bootstrap();
