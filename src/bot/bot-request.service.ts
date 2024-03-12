import { Injectable } from '@nestjs/common';
import { CallbackDataChannel } from '../modules/extensions/bot/callback-data/CallbackDataChannel';
import { CallbackDataAuthentication } from '../modules/extensions/bot/callback-data/CallbackDataAuthentication';
import { MessagesAuthentication } from '../modules/extensions/bot/messages/MessagesAuthentication';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { ChannelsService } from '../channels/channels.service';
import { BotEvent } from './BotEvent';
import type { IBotRequestDto } from './types/bot.types';

@Injectable()
export class BotRequestService {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private channelsService: ChannelsService,
    private botEvent: BotEvent,
  ) {}

  async [CallbackDataChannel.ACCEPT_HANDLER]({ channelId }: IBotRequestDto) {
    await this.channelsService.acceptValidateChannel(channelId);
  }

  async [CallbackDataChannel.CANCEL_REASON_HANDLER]({ from }: IBotRequestDto) {
    await this.botEvent.sendReasonCancelChannel(from.id);
    await this.userService.updateLastBotActive(
      from.id,
      CallbackDataChannel.CANCEL_REASON_HANDLER,
    );
  }

  async [CallbackDataChannel.CANCEL_HANDLER]({
    channelId,
    from,
    reason,
  }: IBotRequestDto) {
    await this.channelsService.cancelValidateChannel(channelId, reason);
    await this.userService.updateLastBotActive(from.id, '');
  }

  async [CallbackDataAuthentication.GET_TOKEN]({ from }: IBotRequestDto) {
    const { id, isAlready } = await this.authService.registrationInBot(from.id);
    const sendToken = async (cb: (id: string) => string) =>
      await global.bot.sendMessage(from.id, cb(String(id)));
    isAlready
      ? await sendToken(MessagesAuthentication.HAS_TOKEN)
      : await sendToken(MessagesAuthentication.NEW_TOKEN);
  }
}
