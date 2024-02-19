import { Injectable } from '@nestjs/common';
import { User } from '../user/models/user.model';
import { SECRET_TOKEN } from '../auth/auth.constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  public async generateToken({ email, id, permissions }: User) {
    return {
      token: await this.jwtService.signAsync(
        { email, id, permissions },
        {
          secret: SECRET_TOKEN,
        },
      ),
    };
  }
}
