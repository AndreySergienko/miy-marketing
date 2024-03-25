import { Body, Controller, Post, Req, Get, Query } from '@nestjs/common';
import {
  BuyChannelDto,
  CheckConnectChannelDto,
  RegistrationChannelDto,
} from './types/types';
import { ChannelsService } from './channels.service';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import type { IQueryFilterAndPagination } from '../database/pagination.types';

@Controller('channels')
export class ChannelsController {
  constructor(
    private channelService: ChannelsService,
    private userService: UserService,
  ) {}

  @Post('check')
  async checkConnectChannel(
    @Req() req: Request,
    @Body()
    { channelName }: CheckConnectChannelDto,
  ) {
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    const userId = this.userService.getId(tokenSplit[1]);
    if (typeof userId !== 'number') return;
    return await this.channelService.checkConnectChannel(userId, channelName);
  }

  @Get('all')
  async getAll(@Query() query: IQueryFilterAndPagination) {
    return await this.channelService.getAll(query);
  }

  @Post('registration')
  async registrationChannel(
    @Req() req: Request,
    @Body() dto: RegistrationChannelDto,
  ) {
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    const userId = this.userService.getId(tokenSplit[1]);
    if (typeof userId !== 'number') return;
    return await this.channelService.registrationChannel(dto, userId);
  }

  @Post('buy')
  async buyAdvertising(@Body() dto: BuyChannelDto) {
    return await this.channelService.buyAdvertising(dto);
  }
}
