import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './types/auth.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(dto: LoginDto): Promise<any> {
    const user = await this.authService.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
