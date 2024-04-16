import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import ErrorMessages from '../../modules/errors/ErrorMessages';
import { PUBLIC_KEY } from '../decorators/public-auth.decorator';
import { AUTH_TOKEN } from '../../constants/auth.value';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) return true;
      if (!req.headers?.cookie) return true;
      const listCookie = req.headers.cookie.split(';');
      let valueCookie: string;
      const authCookie = listCookie.find((cookie: string) => {
        const [key, value] = cookie.split('=');
        valueCookie = value;
        if (key.trim() === AUTH_TOKEN) return value;
      });

      if (authCookie) {
        req.headers['Authorization'] = `Bearer ${valueCookie}`;
      }

      return true;
    } catch (e) {
      console.log(e);
      throw new HttpException(ErrorMessages.FORBIDDEN(), HttpStatus.FORBIDDEN);
    }
  }
}
