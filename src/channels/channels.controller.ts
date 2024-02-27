import { Body, Controller, Post, Req } from '@nestjs/common';
import { checkConnectChannelDto } from './types/types';
import { ChannelsService } from './channels.service';
import { UserService } from '../user/user.service';
import { Request } from 'express';

@Controller('channels')
export class ChannelsController {
  constructor(
    private channelService: ChannelsService,
    private userService: UserService,
  ) {}

  @Post('check-channel')
  async checkConnectChannel(
    @Req() req: Request,
    @Body()
    { channelName }: checkConnectChannelDto,
  ) {
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    const userId = this.userService.getId(tokenSplit[1]);
    if (typeof userId !== 'number') return;
    return await this.channelService.checkConnectChannel(userId, channelName);
  }
}
