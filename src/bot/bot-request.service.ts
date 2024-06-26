import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import BotErrorMessages from './messages/BotErrorMessages';
import SlotsErrorMessages from '../slots/messages/SlotsErrorMessages';

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

  /** Moderator
   * Допустить канал к публикации
   * **/
  public async [CallbackDataChannel.ACCEPT_HANDLER]({
    from,
    id: channelId,
  }: IBotRequestDto) {
    await this.channelsService.acceptValidateChannel(channelId, from.id);
    await this.userService.updateLastBotActive(from.id, '');
  }

  /** Moderator
   * Установить причину отказа публикации канала
   * **/
  public async [CallbackDataChannel.CANCEL_REASON_HANDLER]({
    from,
    id: channelId,
  }: IBotRequestDto) {
    await this.botEvent.sendReasonCancelChannel(from.id);
    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.CANCEL_HANDLER}:${channelId}`,
    );
  }

  /** Moderator
   * Отклонить публикацию канала
   * **/
  public async [CallbackDataChannel.CANCEL_HANDLER]({
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

  /** User
   * Метод инициализации покупки свободного слота
   * Предварительные запрос на приобритение слота
   * **/
  public async checkBuyAdvertising(query: PreCheckoutQuery) {
    let status = false;
    const slot = await this.slotService.findOneBySlotId(+query.invoice_payload);
    if (!slot) {
      await global.bot.answerPreCheckoutQuery(query.id, status, {
        error_message: BotErrorMessages.PRE_CHECKOUT_QUERY,
      });
      return;
    }

    if (slot.statusId === StatusStore.PUBLIC) status = true;
    await global.bot.answerPreCheckoutQuery(query.id, status, {
      error_message: BotErrorMessages.PRE_CHECKOUT_QUERY,
    });
  }

  /** User
   * Метод срабатывает после успешной оплаты
   * Добавить сведения о платеже в ЛК
   * Предложить пользователю отправить сообещний на рекламу
   * **/
  public async afterBuyAdvertising({
    from,
    successful_payment,
  }: TelegramBot.Message) {
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
      statusId: StatusStore.PAID,
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

  /** User
   * Метод срабатывает после отправки рекламного сообщения боту
   * С предложением отправки или изменения его
   * **/
  public async [CallbackDataChannel.VALIDATE_MESSAGE_HANDLER]({
    from,
    id: slotId,
    text,
  }: IBotRequestDto) {
    const user = await this.userService.findUserByChatId(from.id);
    if (!user) return;
    await this.userService.clearLastBotActive(from.id);
    await this.publisherMessages.createMessage({
      message: text,
      slotId,
      userId: user.id,
    });
    await global.bot.sendMessage(
      from.id,
      MessagesChannel.CONFIRM_SEND_MESSAGE_VERIFICATION(text),
      useSendMessage({
        inline_keyboard: KeyboardChannel.SEND_VALIDATE_USER_MESSAGE(slotId),
      }),
    );
  }

  /** User
   * Измениние только что созданного сообщение на другое для отправки на модерацию
   * **/
  public async [CallbackDataChannel.CHANGE_SEND_MESSAGE_HANDLER]({
    from,
    id: slotId,
  }: IBotRequestDto) {
    const slot = await this.slotService.findOneBySlotId(slotId);
    if (!slot)
      throw new HttpException(
        SlotsErrorMessages.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    if (slot.statusId === StatusStore.AWAIT) return;

    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.VALIDATE_MESSAGE_HANDLER}:${slotId}`,
    );

    await global.bot.sendMessage(
      from.id,
      MessagesChannel.SEND_MESSAGE_VERIFICATION,
    );
  }

  /** User
   * Метод срабатывает после отправки рекламного сообщения МОДЕРАТОРУ
   * **/
  public async [CallbackDataChannel.CONFIRM_SEND_MESSAGE_HANDLER]({
    from,
    id: slotId,
  }: IBotRequestDto) {
    const slot = await this.slotService.findOneBySlotId(slotId);

    if (!slot)
      throw new HttpException(
        SlotsErrorMessages.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    if (slot.statusId === StatusStore.AWAIT) return;

    await this.userService.clearLastBotActive(from.id);
    await global.bot.sendMessage(
      from.id,
      MessagesChannel.SUCCESS_SEND_TO_MODERATE,
    );

    const ids = await this.userService.getAllAdminsChatIds();
    await global.bot.sendMessage(
      ids[0],
      MessagesChannel.VALIDATE_MESSAGE(slot.message.message),
      useSendMessage({
        inline_keyboard: KeyboardChannel.VALIDATE_MESSAGE(slotId),
      }),
    );
  }

  /** MODERATOR
   * Метод срабатывает после успешной проверки рекламного сообщения
   * **/
  public async [CallbackDataChannel.ACCEPT_MESSAGE_HANDLER]({
    id: slotId,
    from,
  }: IBotRequestDto) {
    const slot = await this.slotService.findOneBySlotId(slotId);
    if (!slot) return;
    const ids = await this.userService.getAllAdminsChatIds();
    if (slot.statusId !== StatusStore.AWAIT)
      return await global.bot.sendMessage(
        ids[0],
        MessagesChannel.SLOT_IS_NOT_ACTIVE_STATUS(),
        useSendMessage({
          remove_keyboard: true,
        }),
      );
    await this.slotService.updateSlotStatusById(slotId, StatusStore.PROCESS);
    const channelId = slot.channel.id;
    const channel = await this.channelsService.findById(channelId);
    /** Сообщение для админа канала **/
    const isNotificationAdminChannel = channel.users[0].isNotification;
    if (isNotificationAdminChannel) {
      await global.bot.sendMessage(
        channel.users[0].chatId,
        MessagesChannel.MESSAGE_IS_VALIDATION('admin'),
        useSendMessage({
          remove_keyboard: true,
        }),
      );
    }

    /** Сообщение для рекламодателя **/
    await global.bot.sendMessage(
      from.id,
      MessagesChannel.MESSAGE_IS_VALIDATION('reclam'),
      useSendMessage({
        remove_keyboard: true,
      }),
    );
    /** Сообщение для модератора **/
    await global.bot.sendMessage(
      ids[0],
      MessagesChannel.MESSAGE_IS_VALIDATION('moder'),
      useSendMessage({
        remove_keyboard: true,
      }),
    );
  }

  /** MODERATOR
   * Необходимо пояснение причины отклонения рекламного сообщения
   * **/
  public async [CallbackDataChannel.CANCEL_REASON_MESSAGE_HANDLER]({
    from,
    id: slotId,
  }: IBotRequestDto) {
    await this.botEvent.sendReasonCancelChannel(from.id);
    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.CANCEL_HANDLER}:${slotId}`,
    );
  }

  /** MODERATOR
   * Отклонение рекламного сообщения в процессе модерации
   * Возврат средств
   * Публикация слота
   * **/
  public async [CallbackDataChannel.CANCEL_MESSAGE_HANDLER]({
    from,
    id,
  }: IBotRequestDto) {
    const slot = await this.slotService.findOneBySlotId(id);
    await this.publisherMessages.destroy(slot.messageId);
    await slot.$set('status', StatusStore.PUBLIC);
    await slot.$set('message', '');
    // Отправить сообщение покупателю text и mainAdmin в чат, что статус изменён
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
