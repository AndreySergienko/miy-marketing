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
import { PaymentsService } from '../payments/payments.service';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';
import { StatusStore } from '../status/StatusStore';
import { useSendMessage } from '../hooks/useSendMessage';
import { KeyboardChannel } from '../modules/extensions/bot/keyboard/KeyboardChannel';
import { PublisherMessagesService } from '../publisher-messages/publisher-messages.service';
import BotErrorMessages from './messages/BotErrorMessages';
import SlotsErrorMessages from '../slots/messages/SlotsErrorMessages';
import { KeyboardAuthentication } from '../modules/extensions/bot/keyboard/KeyboardAuthentication';
import { convertUtcDateToFullDate } from '../utils/date';
import { ICreateAdvertisementMessage } from '../channels/types/types';
import { AdvertisementService } from 'src/advertisement/advertisement.service';
import { getFormatChannelDuration } from 'src/channels/utils/getFormatChannelDuration';
import { Advertisement } from 'src/advertisement/models/advertisement.model';

@Injectable()
export class BotRequestService {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private channelsService: ChannelsService,
    private advertisementService: AdvertisementService,
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

    if (!query.invoice_payload) return;

    const [channelId, timestamp] = query.invoice_payload.split(':');

    const advertisement =
      await this.advertisementService.findByTimestampAndChannelId(
        +timestamp,
        +channelId,
      );

    if (advertisement) {
      await global.bot.answerPreCheckoutQuery(query.id, status, {
        error_message: BotErrorMessages.PRE_CHECKOUT_QUERY,
      });
      return;
    }

    status = true;
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
    if (!successful_payment.invoice_payload) return;

    const [channelId, timestamp, formatChannel, slot] =
      successful_payment.invoice_payload.split(':');

    const timestampFinish =
      +timestamp + 1000 * 60 * 60 * getFormatChannelDuration(formatChannel);

    const advertisement = await this.advertisementService.createAdvertisement({
      timestamp: +timestamp,
      timestampFinish,
      channelId: +channelId,
      slotId: +slot,
    });

    await this.paymentsService.addPayment({
      price: successful_payment.total_amount / 100,
      userId: user.id,
      slotId: advertisement.id,
      statusId: StatusStore.PAID,
      productId: successful_payment.telegram_payment_charge_id,
    });

    await advertisement.update(
      { publisherId: user.id },
      { where: { id: advertisement.id } },
    );
    await advertisement.$set('status', StatusStore.AWAIT);

    await global.bot.sendMessage(
      from.id,
      MessagesChannel.SEND_MESSAGE_VERIFICATION,
    );

    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.VALIDATE_MESSAGE_HANDLER}:${advertisement.id}`,
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
    const slot = await this.advertisementService.findOneById(slotId);
    if (!slot)
      throw new HttpException(
        SlotsErrorMessages.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    if (slot.statusId !== StatusStore.AWAIT) return;

    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.VALIDATE_MESSAGE_HANDLER}:${slotId}`,
    );

    await global.bot.sendMessage(
      from.id,
      MessagesChannel.CHANGE_MESSAGE_VERIFICATION,
    );
  }

  private async getChannelOwner(slot: Advertisement) {
    const channel = await this.channelsService.findById(slot.channel.id);
    if (!channel.users[0].isNotification) return;

    return channel.users[0];
  }

  /** User
   * Метод срабатывает после отправки рекламного сообщения МОДЕРАТОРУ
   * **/
  public async [CallbackDataChannel.CONFIRM_SEND_MESSAGE_HANDLER]({
    from,
    id: slotId,
  }: IBotRequestDto) {
    const slot = await this.advertisementService.findOneById(slotId);

    if (!slot)
      throw new HttpException(
        SlotsErrorMessages.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    if (slot.statusId === StatusStore.MODERATE_MESSAGE) return;

    await slot.$set('status', StatusStore.MODERATE_MESSAGE);
    await this.userService.clearLastBotActive(from.id);
    await global.bot.sendMessage(
      from.id,
      MessagesChannel.SUCCESS_SEND_TO_MODERATE,
    );

    console.log('BEFORE OWNER');
    const channel = await this.channelsService.findById(slot.channel.id);
    const owner = channel.users[0];
    // const owner = await this.getChannelOwner(slot);
    console.log('AFTER OWNER', owner);
    const admins = await this.userService.getAllAdminsChatIds();

    const id = owner.isNotification ? owner.chatId : admins[0];
    console.log('ID', id);
    const text = slot.message.message;
    const message = owner.isNotification
      ? MessagesChannel.VALIDATE_MESSAGE_PUBLISHER(text)
      : MessagesChannel.VALIDATE_MESSAGE(text, slot.channel.conditionCheck);

    if (owner.isNotification) {
      await global.bot.sendMessage(
        id,
        message,
        useSendMessage({
          inline_keyboard: KeyboardChannel.VALIDATE_MESSAGE(slotId),
        }),
      );
    } else {
      for (let i = 0; i < admins.length; i++) {
        const adminId = admins[i];

        await global.bot.sendMessage(
          adminId,
          message,
          useSendMessage({
            inline_keyboard: KeyboardChannel.VALIDATE_MESSAGE(slotId),
          }),
        );
      }
    }
  }

  /** MODERATOR
   * Метод срабатывает после успешной проверки рекламного сообщения
   * **/
  public async [CallbackDataChannel.ACCEPT_MESSAGE_HANDLER]({
    id: slotId,
  }: IBotRequestDto) {
    const slot = await this.advertisementService.findOneById(slotId);
    if (!slot) return;

    const channel = await this.channelsService.findById(slot.channel.id);
    const owner = channel.users[0];
    // const owner = await this.getChannelOwner(slot);
    const admins = await this.userService.getAllAdminsChatIds();

    const id = owner.isNotification ? owner.chatId : admins[0];

    if (slot.statusId !== StatusStore.MODERATE_MESSAGE)
      return await global.bot.sendMessage(
        id,
        MessagesChannel.SLOT_IS_NOT_ACTIVE_STATUS(),
        useSendMessage({
          remove_keyboard: true,
        }),
      );
    await this.advertisementService.updateStatusById({
      slotId,
      statusId: StatusStore.PROCESS,
    });
    // const channel = await this.channelsService.findById(channelId);
    const message = await this.publisherMessages.findById(slot.messageId);
    if (!message) return;
    const advertiser = await this.userService.findOneById(message.userId);
    if (!advertiser) return;

    console.log('BEFORE CHANNEL NAME 300');
    const channelName = channel.name;
    const day = convertUtcDateToFullDate(slot.timestamp);
    const format = await this.channelsService.findFormatById(
      slot.slot.formatChannelId,
    );
    const formatName = format.value;
    const dataMessage: ICreateAdvertisementMessage = {
      channelName,
      day,
      format: formatName,
      message: message.message,
    };

    /** Сообщение для админа канала **/
    await global.bot.sendMessage(
      owner.chatId,
      MessagesChannel.ADMIN_CHANNEL_CREATE_ADVERTISEMENT(dataMessage),
      useSendMessage({
        remove_keyboard: true,
      }),
    );

    /** Сообщение для рекламодателя **/
    await global.bot.sendMessage(
      advertiser.chatId,
      MessagesChannel.ADVERTISER_CREATE_ADVERTISEMENT(dataMessage),
      useSendMessage({
        remove_keyboard: true,
      }),
    );

    /** Сообщение для модератора **/
    for (let i = 0; i < admins.length; i++) {
      const adminId = admins[i];
      await global.bot.sendMessage(
        adminId,
        MessagesChannel.MODERATOR_CREATE_ADVERTISEMENT({
          ...dataMessage,
          advertiser,
          owner,
        }),
        useSendMessage({
          inline_keyboard: KeyboardChannel.SET_ERID(slotId),
        }),
      );
    }
  }

  public async [CallbackDataChannel.SET_ERID_HANDLER]({ from, id: slotId }) {
    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.AFTER_SET_ERID_MESSAGE(slotId)}`,
    );

    const admins = await this.userService.getAllAdminsChatIds();
    for (let i = 0; i < admins.length; i++) {
      const adminId = admins[i];

      await global.bot.sendMessage(
        adminId,
        MessagesChannel.INPUT_TO_FIELD_ERID,
        useSendMessage({
          remove_keyboard: true,
        }),
      );
    }
  }

  public async [CallbackDataChannel.AFTER_SET_ERID_HANDLER]({
    from,
    id: slotId,
    text,
  }) {
    const advertisement = await this.advertisementService.findOneById(slotId);
    console.log('===================advertisement', advertisement);
    if (!advertisement) return;
    const message = await this.publisherMessages.findById(
      advertisement.messageId,
    );
    console.log('======================message', message);
    if (!message) return;
    const updateMessage = `${message.message}

Erid: ${text}`;

    console.log('======================message', updateMessage);
    const admins = await this.userService.getAllAdminsChatIds();
    await this.userService.clearLastBotActive(from.id);
    for (let i = 0; i < admins.length; i++) {
      const adminId = admins[i];
      await global.bot.sendMessage(
        adminId,
        updateMessage,
        useSendMessage({
          inline_keyboard: KeyboardChannel.CHANGE_ERID(slotId, updateMessage),
        }),
      );
      // await global.bot.sendMessage(
      //   adminId,
      //   MessagesChannel.UPDATE_ERID_MESSAGE_IS_CORRECT_QUESTION,
      //   useSendMessage({
      //     inline_keyboard: KeyboardChannel.CHANGE_ERID(slotId, updateMessage),
      //   }),
      // );
    }
  }

  public async [CallbackDataChannel.ACCEPT_ERID_MESSAGE_HANDLER]({
    from,
    id: slotId,
    other,
  }) {
    const lastMessage = other[other.length - 1];
    if (!lastMessage) return;
    const advertisement = await this.advertisementService.findOneById(slotId);
    await this.publisherMessages.updateMessage(
      advertisement.messageId,
      lastMessage,
    );
    await this.userService.clearLastBotActive(from.id);

    const admins = await this.userService.getAllAdminsChatIds();
    for (let i = 0; i < admins.length; i++) {
      const adminId = admins[i];
      await global.bot.sendMessage(
        adminId,
        MessagesChannel.SUCCESS_MESSAGE_UPDATE,
        useSendMessage({
          remove_keyboard: true,
        }),
      );
    }
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
      CallbackDataChannel.CANCEL_MESSAGE(slotId),
    );
  }

  /** MODERATOR
   * Поправить сообщение, которое пришло на проверку
   * Срабатывает, когда нажимают изменить
   * Отправка месседж и ожидание нового сообщения
   * **/
  public async [CallbackDataChannel.CHANGE_VALIDATE_MESSAGE_HANDLER]({
    from,
    id: slotId,
  }: IBotRequestDto) {
    await this.userService.updateLastBotActive(
      from.id,
      `${CallbackDataChannel.AFTER_CHANGE_VALIDATE_MESSAGE(slotId)}`,
    );
    await global.bot.sendMessage(
      from.id,
      MessagesChannel.CHANGE_MESSAGE_VERIFICATION,
    );
  }

  /** MODERATOR
   * Показать набор кнопок и снова сообщение на модерацию сообщения, после того, как модератор его поправил
   * **/
  public async [CallbackDataChannel.AFTER_CHANGE_VALIDATE_MESSAGE_HANDLER]({
    from,
    text,
    id: slotId,
  }: IBotRequestDto) {
    const slot = await this.advertisementService.findOneById(slotId);
    if (!slot)
      throw new HttpException(
        SlotsErrorMessages.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    if (slot.statusId !== StatusStore.MODERATE_MESSAGE) return;
    await this.publisherMessages.updateMessage(slot.messageId, text);
    await this.userService.clearLastBotActive(from.id);

    const owner = await this.getChannelOwner(slot);
    const admins = await this.userService.getAllAdminsChatIds();

    const id = owner ? owner.chatId : admins[0];

    const message = owner
      ? MessagesChannel.VALIDATE_MESSAGE_PUBLISHER(text)
      : MessagesChannel.VALIDATE_MESSAGE(text, slot.channel.conditionCheck);

    await global.bot.sendMessage(
      id,
      message,
      useSendMessage({
        inline_keyboard: KeyboardChannel.VALIDATE_MESSAGE(slotId),
      }),
    );
  }

  /** MODERATOR
   * Отклонение рекламного сообщения в процессе модерации
   * Возврат средств
   * Публикация слота
   * **/
  public async [CallbackDataChannel.CANCEL_MESSAGE_HANDLER]({
    from,
    text,
    id,
  }: IBotRequestDto) {
    const slot = await this.advertisementService.findOneById(id);
    if (!slot) return;
    if (slot.statusId !== StatusStore.AWAIT) {
      const owner = await this.getChannelOwner(slot);
      const admins = await this.userService.getAllAdminsChatIds();

      const id = owner ? owner.chatId : admins[0];

      await global.bot.sendMessage(
        id,
        MessagesChannel.SLOT_IS_NOT_AWAIT,
        useSendMessage({
          remove_keyboard: true,
        }),
      );
      return;
    }
    await this.publisherMessages.destroy(slot.messageId);
    await slot.$set('status', StatusStore.PUBLIC);
    // await slot.$set('message', '');
    // Отправить сообщение покупателю text и mainAdmin в чат, что статус изменён
    await this.userService.clearLastBotActive(from.id);

    const user = await this.userService.findOneById(slot.message.userId);
    if (!user) return;
    await global.bot.sendMessage(
      user.chatId,
      MessagesChannel.MESSAGE_SUCCESS_CANCEL(text),
      useSendMessage({
        remove_keyboard: true,
      }),
    );

    const ids = await this.userService.getAllAdminsChatIds();
    await global.bot.sendMessage(
      ids[0],
      MessagesChannel.MESSAGE_SUCCESS_CANCEL(text),
      useSendMessage({
        remove_keyboard: true,
      }),
    );
  }

  /** User
   * Получение кода первификации пользователем **/
  async [CallbackDataAuthentication.GET_TOKEN]({ from }: IBotRequestDto) {
    const { id, isAlready } = await this.authService.registrationInBot(from.id);
    const sendToken = async (cb: (id: string) => string) =>
      await global.bot.sendMessage(
        from.id,
        cb(String(id)),
        useSendMessage({
          inline_keyboard: KeyboardAuthentication.GO_SITE(String(id)),
        }),
      );
    isAlready
      ? await sendToken(MessagesAuthentication.HAS_TOKEN)
      : await sendToken(MessagesAuthentication.NEW_TOKEN);
  }
}
