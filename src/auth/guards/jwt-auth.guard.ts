import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ErrorMessages from '../../modules/errors/ErrorMessages';
import { SECRET_TOKEN } from '../auth.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authorization = req.headers.authorization;
      const [bearer, token] = authorization.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException(ErrorMessages.UN_AUTH());
      }

      req.user = await this.jwtService.verifyAsync(token, {
        secret: SECRET_TOKEN,
      });
      return true;
    } catch (e) {
      throw new HttpException(ErrorMessages.FORBIDDEN(), HttpStatus.FORBIDDEN);
    }
  }
}
