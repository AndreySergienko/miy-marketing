import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission-auth.decorator';
import ErrorMessages from '../../modules/errors/ErrorMessages';
import { SECRET_TOKEN } from '../auth.constants';
import type { Permission } from '../../permission/models/persmissions.model';
import { PUBLIC_KEY } from '../decorators/public-auth.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) return true;

      const requiredPermissions = this.reflector.getAllAndOverride(
        PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredPermissions) return true;

      const authorization = req.headers.authorization;
      const [bearer, token] = authorization.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException(ErrorMessages.UN_AUTH());
      }

      const user = this.jwtService.verify(token, {
        secret: SECRET_TOKEN,
      });
      req.user = user;
      return user.permissions.some((permission: Permission) =>
        requiredPermissions.includes(permission.value),
      );
    } catch (e) {
      throw new HttpException(ErrorMessages.FORBIDDEN(), HttpStatus.FORBIDDEN);
    }
  }
}
