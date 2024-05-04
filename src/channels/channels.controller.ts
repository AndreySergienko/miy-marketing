import { Body, Controller, Post, Req, Get, Query } from '@nestjs/common';
import {
  BuyChannelDto,
  CheckConnectChannelDto,
  RegistrationChannelDto,
} from './types/types';
import { ChannelsService } from './channels.service';
import type { IQueryFilterAndPagination } from '../database/pagination.types';
import { Perms } from '../auth/decorators/permission-auth.decorator';
import PermissionStore from '../permission/PermissionStore';
import { Public } from '../auth/decorators/public-auth.decorator';

@Controller('channels')
export class ChannelsController {
  constructor(private channelService: ChannelsService) {}

  @Perms(PermissionStore.CAN_CHECK_CHANNEL)
  @Post('check')
  async checkConnectChannel(
    @Req() req: Request,
    @Body()
    { channelName }: CheckConnectChannelDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error;
    const userId = req.user.id;
    if (typeof userId !== 'number') return;
    return await this.channelService.checkConnectChannel(userId, channelName);
  }

  @Public()
  @Get('all')
  async getAll(@Query() query: IQueryFilterAndPagination) {
    return await this.channelService.getAll(query);
  }

  @Perms(PermissionStore.CAN_PUBLIC_CHANNEL)
  @Post('registration')
  async registrationChannel(
    @Req() req: Request,
    @Body() dto: RegistrationChannelDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error;
    const userId = req.user.id;
    if (typeof userId !== 'number') return;
    return await this.channelService.registrationChannel(dto, userId);
  }

  @Perms(PermissionStore.CAN_BUY)
  @Post('buy')
  async buyAdvertising(@Req() req: Request, @Body() dto: BuyChannelDto) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error;
    const userId = req.user.id;
    if (typeof userId !== 'number') return;
    return await this.channelService.buyAdvertising(dto, userId);
  }
}
