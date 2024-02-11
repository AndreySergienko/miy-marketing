import { Controller, Get, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async create() {
    await this.userService.create();
  }

  @Get('me')
  async getMe() {
    await this.userService.findOne({ wem });
  }

  @Put('update')
  async update() {
    await this.userService.update();
  }
}
