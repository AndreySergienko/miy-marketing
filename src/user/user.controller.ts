import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Perms } from '../auth/decorators/permission-auth.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Perms('CAN_BUY')
  @Post('create')
  async create() {
    return 'Пользователь создан';
  }

  @Get('me')
  async getMe() {
    return 'Пользователь получен';
  }
}
