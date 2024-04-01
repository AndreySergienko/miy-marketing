import { Injectable } from '@nestjs/common';
import { CallbackDataChannel } from '../modules/extensions/bot/callback-data/CallbackDataChannel';
import { CallbackDataAuthentication } from '../modules/extensions/bot/callback-data/CallbackDataAuthentication';
import { MessagesAuthentication } from '../modules/extensions/bot/messages/MessagesAuthentication';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { ChannelsService } from '../channels/channels.service';
import { BotEvent } from './BotEvent';
import type { IBotRequestDto } from './types/bot.types';
import TelegramBot, { PreCheckoutQuery } from 'node-telegram-bot-api';
import { SlotsService } from '../slots/slots.service';
import { PaymentsService } from '../payments/payments.service';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';
import { StatusStore } from '../status/StatusStore';
import { useSendMessage } from '../hooks/useSendMessage';
import { KeyboardChannel } from '../modules/extensions/bot/keyboard/KeyboardChannel';
import { PublisherMessagesService } from '../publisher-messages/publisher-messages.service';

@Injectable()
export class BotRequestService {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private channelsService: ChannelsService,
    private slotService: SlotsService,
    private botEvent: BotEvent,
    private paymentsService: PaymentsService,
    private publisherMessages: PublisherMessagesService,
  ) {}

  async [CallbackDataChannel.ACCEPT_HANDLER]({
    from,
    id: channelId,
  }: IBotRequestDto) {
    await this.channelsService.acceptValidateChannel(channelId, from.id);
    await this.userService.updateLastBotActive(from.id, '');
  }

  async [CallbackDataChannel.CANCEL_REASON_HANDLER]({
    from,
    id: channelId,
  }: IBotRequestDto) {
    await this.botEvent.sendReasonCancelChannel(from.id);
    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.CANCEL_HANDLER}:${channelId}`,
    );
  }

  async [CallbackDataChannel.CANCEL_HANDLER]({
    id: channelId,
    from,
    text: reason,
  }: IBotRequestDto) {
    await this.channelsService.cancelValidateChannel(
      channelId,
      reason,
      from.id,
    );
    await this.userService.clearLastBotActive(from.id);
  }

  async checkBuyAdvertising(query: PreCheckoutQuery) {
    let status = false;
    const slot = await this.slotService.findOneBySlotId(+query.invoice_payload);
    if (!slot) {
      await global.bot.answerPreCheckoutQuery(query.id, status);
      return;
    }

    if (slot.statusId === StatusStore.PUBLIC) status = true;
    await global.bot.answerPreCheckoutQuery(query.id, status);
  }

  async afterBuyAdvertising({ from, successful_payment }: TelegramBot.Message) {
    const user = await this.userService.findUserByChatId(from.id);
    if (!user) return;
    const slot = await this.slotService.findOneBySlotId(
      +successful_payment.invoice_payload,
    );
    if (!slot) return;

    await this.paymentsService.addPayment({
      price: successful_payment.total_amount,
      userId: user.id,
      slotId: slot.id,
    });

    await slot.$set('status', StatusStore.AWAIT);

    await global.bot.sendMessage(
      from.id,
      MessagesChannel.SEND_MESSAGE_VERIFICATION,
    );

    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.VALIDATE_MESSAGE_HANDLER}:${slot.id}`,
    );
  }

  async [CallbackDataChannel.VALIDATE_MESSAGE_HANDLER]({
    from,
    id: slotId,
    text,
  }: IBotRequestDto) {
    await this.userService.clearLastBotActive(from.id);
    await global.bot.sendMessage(
      from.id,
      MessagesChannel.CONFIRM_SEND_MESSAGE_VERIFICATION(text),
      useSendMessage({
        inline_keyboard: KeyboardChannel.SEND_VALIDATE_USER_MESSAGE(slotId),
      }),
    );
  }

  async [CallbackDataChannel.CHANGE_SEND_MESSAGE_HANDLER]({
    from,
    id: slotId,
  }: IBotRequestDto) {
    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.VALIDATE_MESSAGE_HANDLER}:${slotId}`,
    );

    await global.bot.sendMessage(
      from.id,
      MessagesChannel.SEND_MESSAGE_VERIFICATION,
    );
  }

  async [CallbackDataChannel.CONFIRM_SEND_MESSAGE_HANDLER]({
    from,
    text,
    id: slotId,
  }: IBotRequestDto) {
    await this.userService.clearLastBotActive(from.id);
    await global.bot.sendMessage(
      from.id,
      MessagesChannel.SUCCESS_SEND_TO_MODERATE,
    );
    await this.publisherMessages.createMessage({
      message: text,
      slotId,
    });
    // сообщению добавить юзера
    // сообщение связать со слотом

    const ids = await this.userService.getAllAdminsChatIds();
    await global.bot.sendMessage(
      ids[0],
      MessagesChannel.VALIDATE_MESSAGE(text),
      useSendMessage({
        inline_keyboard: KeyboardChannel.VALIDATE_MESSAGE(slotId),
      }),
    );
  }

  async [CallbackDataChannel.ACCEPT_MESSAGE_HANDLER]({}: IBotRequestDto) {
    // изменить статус на process slot'a
  }

  async [CallbackDataChannel.CANCEL_REASON_MESSAGE_HANDLER]({}: IBotRequestDto) {
    // установить последнюю активность
    // предложить отправку сообщения
  }

  async [CallbackDataChannel.CANCEL_MESSAGE_HANDLER]({
    from,
    id,
    text,
  }: IBotRequestDto) {
    const slot = await this.slotService.findOneBySlotId(id);
    await slot.$set('status', StatusStore.PUBLIC);
    await slot.$set('message', '');
    // Отправить сообщение покупателю text и mainAdminu в чат, что статус изменён
    await this.userService.clearLastBotActive(from.id);
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
