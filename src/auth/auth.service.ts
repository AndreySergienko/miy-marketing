import { Injectable } from '@nestjs/common';
import { User } from '../user/model/user.model';
import { LoginDto } from './types/auth.types';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async registration() {}

  async validateUser({ email, password }: LoginDto) {
    const user: User = await this.userService.findOne({ email });
    if (!user) return;
    // Временно
    if (user.password === password) return true;
  }

  async login(user: User) {
    const payload = user;
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout() {}
}
