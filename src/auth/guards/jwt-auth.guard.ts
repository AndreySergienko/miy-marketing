import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SECRET_TOKEN } from '../auth.constants';
import UserErrorMessages from '../../user/messages/UserErrorMessages';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authorization = req.headers.authorization;
      const [bearer, token] = authorization.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException(UserErrorMessages.UN_AUTH);
      }

      req.user = await this.jwtService.verifyAsync(token, {
        secret: SECRET_TOKEN,
      });
      return true;
    } catch (e) {
      throw new HttpException(
        UserErrorMessages.FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
