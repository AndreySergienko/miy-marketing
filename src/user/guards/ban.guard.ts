import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PayloadTokenDto } from '../../token/types/token.types';
import UserErrorMessages from '../messages/UserErrorMessages';

@Injectable()
export class BanGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authorization = req.headers.authorization;
      const token = authorization.split(' ');
      const { id } = this.jwtService.decode<PayloadTokenDto>(token[1]);
      if (!id) throw new UnauthorizedException(UserErrorMessages.UN_AUTH);
      // TODO бан сервис и проверка на блокировку
      return true;
    } catch (e) {
      throw new HttpException(
        UserErrorMessages.FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
