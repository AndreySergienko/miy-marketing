import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Perms } from '../auth/decorators/permission-auth.decorator';
import {
  BanUserDto,
  PardonUserDto,
  UpdateEmailDto,
  UpdateUserDto,
} from './types/user.types';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Perms('CAN_BAN')
  @Post('ban')
  async ban(@Body() dto: BanUserDto) {
    return await this.userService.banUser(dto);
  }

  @Perms('CAN_PARDON')
  @Post('pardon')
  async pardon(@Body() dto: PardonUserDto) {
    return await this.userService.pardonUser(dto);
  }

  @Post('update/email')
  async updateEmail(@Req() req: Request, @Body() dto: UpdateEmailDto) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    return this.userService.updateEmail(tokenSplit[1], dto);
  }

  @Perms('CAN_USER_UPDATE')
  @Post('update')
  async updateUser(@Req() req: Request, @Body() dto: UpdateUserDto) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    return await this.userService.updateUser(tokenSplit[1], dto);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    return await this.userService.getMe(tokenSplit[1]);
  }
}
