import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Perms } from '../auth/decorators/permission-auth.decorator';
import {
  BanUserDto,
  PardonUserDto,
  UpdateEmailDto,
  UpdateUserDto,
} from './types/user.types';
import PermissionStore from '../permission/PermissionStore';
import { getToken } from '../token/token.utils';
import { Public } from '../auth/decorators/public-auth.decorator';
import * as process from 'node:process';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Perms(PermissionStore.CAN_BAN)
  @Post('ban')
  async ban(@Body() dto: BanUserDto) {
    return await this.userService.banUser(dto);
  }

  @Perms(PermissionStore.CAN_PARDON)
  @Post('pardon')
  async pardon(@Body() dto: PardonUserDto) {
    return await this.userService.pardonUser(dto);
  }

  @Perms(PermissionStore.CAN_USER_UPDATE)
  @Put('update/email')
  async updateEmail(@Req() req: Request, @Body() dto: UpdateEmailDto) {
    return this.userService.updateEmail(getToken(req), dto);
  }

  @Put('update')
  async updateUser(@Req() req: Request, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(getToken(req), dto);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    return await this.userService.getMe(getToken(req));
  }

  @Public()
  @Post('set/admin')
  setAdmin(@Body() { userId, token }: { userId: number; token: string }) {
    if (token !== process.env.SECRET_TOKEN) return;
    return this.userService.setAdmin(userId);
  }
}
