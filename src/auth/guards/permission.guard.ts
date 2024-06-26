import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission-auth.decorator';
import { SECRET_TOKEN } from '../auth.constants';
import type { Permission } from '../../permission/models/persmissions.model';
import { PUBLIC_KEY } from '../decorators/public-auth.decorator';
import { UserService } from '../../user/user.service';
import UserErrorMessages from '../../user/messages/UserErrorMessages';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      const authorization = req.headers.authorization;
      const [bearer, token] = authorization.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException(UserErrorMessages.UN_AUTH);
      }

      const user = this.jwtService.verify(token, {
        secret: SECRET_TOKEN,
      });

      if (!user.id) return;

      const userDb = await this.userService.findOneById(user.id);
      req.user = user;
      if (!requiredPermissions) return true;
      const isSome = userDb.permissions.some((permission: Permission) =>
        requiredPermissions.includes(permission.id),
      );
      if (!isSome)
        throw new HttpException(
          UserErrorMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        );

      return true;
    } catch (e) {
      throw new HttpException(
        UserErrorMessages.FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
