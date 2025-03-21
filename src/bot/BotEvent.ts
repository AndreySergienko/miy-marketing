import { Injectable } from '@nestjs/common';
import { useSendMessage } from '../hooks/useSendMessage';
import { KeyboardChannel } from '../modules/extensions/bot/keyboard/KeyboardChannel';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';
import { Channel } from '../channels/models/channels.model';
import { convertUtcDateToFullDateMoscow } from '../utils/date';
import type {
  IBuyChannelMessage,
  IValidationCancelChannelDto,
  IValidationChannelDto,
} from '../channels/types/types';
import * as process from 'process';
import type { IPublishingMessages } from './types/bot.types';

@Injectable()
export class BotEvent {
  /** Метод срабатывает для уведомления админа канала и рекламодателя о удаление сообщения в его канале */
  public async sendAfterDeleteMessage(obj: IPublishingMessages) {
    await this.sendNotificationMessage(
      obj,
      `❌Реклама в канале ${obj.channelName} удалена. `,
    );
  }

  private async sendNotificationMessage(
    { publisherId, channelDate, channelName }: IPublishingMessages,
    message: string,
  ) {
    const ids = [publisherId];

    for (let i = 0; i < ids.length; i++) {
      await global.bot.sendMessage(
        ids[i],
        `${message} ${channelName}: ${convertUtcDateToFullDateMoscow(channelDate)}`,
      );
    }
  }

  /** Метод срабатывает для уведомления админа канала и рекламодателя о публикации сообщения в его канале */
  public async sendAfterPublicMessage(obj: IPublishingMessages) {
    await this.sendNotificationMessage(
      obj,
      `✅Реклама в канале ${obj.channelName} опубликована.`,
    );
  }

  async sendInvoiceBuyAdvertising(chatId: number, dto: IBuyChannelMessage) {
    const price = dto.price
      .toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
      .split('₽');
    const provider_data = JSON.stringify({
      receipt: {
        email: dto.email,
        items: [
          {
            description: 'Покупка рекламной интеграции',
            quantity: '1.00',
            amount: {
              value: price[0].trim().replace(/,/g, '.'),
              currency: 'RUB',
            },
            // TODO вынести в env
            vat_code: 1,
          },
        ],
      },
    });
    return await global.bot.sendInvoice(
      chatId,
      'Покупка рекламной интеграции в канале',
      MessagesChannel.BUY_ADVERTISING(dto),
      `${dto.channelId}:${dto.date}:${dto.format}:${dto.slotId}`,
      process.env.PAYMENT_TOKEN,
      'RUB',
      [
        {
          label: 'Покупка',
          amount: dto.price * 100,
        },
      ],
      {
        provider_data,
      },
    );
  }

  async getAdministrators(chatId: number) {
    return await global.bot.getChatAdministrators(chatId);
  }

  async sendReasonCancelChannel(chatId: number) {
    return await global.bot.sendMessage(
      chatId,
      MessagesChannel.REASON_CANCEL_CHANNEL,
    );
  }

  async sendMessageAcceptChannel(
    chatId: number,
    dto: IValidationChannelDto,
    isModer?: boolean,
  ) {
    if (isModer) {
      return await global.bot.sendMessage(
        chatId,
        MessagesChannel.MODER_ACCEPT_REGISTRATION,
        useSendMessage({
          inline_keyboard: [],
        }),
      );
    }
    return await global.bot.sendMessage(
      chatId,
      MessagesChannel.ACCEPT_REGISTRATION(dto),
      useSendMessage({
        inline_keyboard: KeyboardChannel.GO_TO_PERSONAL,
      }),
    );
  }

  async sendMessageCancelChannel(
    chatId: number,
    dto: IValidationCancelChannelDto,
    isModer?: boolean,
  ) {
    if (isModer) {
      return await global.bot.sendMessage(
        chatId,
        MessagesChannel.MODER_CANCEL_REGISTRATION,
        useSendMessage({
          inline_keyboard: [],
        }),
      );
    }
    return await global.bot.sendMessage(
      chatId,
      MessagesChannel.CANCEL_REGISTRATION(dto),
      useSendMessage({
        inline_keyboard: [],
      }),
    );
  }

  async sendMessageAdminAfterCreateChannel(
    adminId: number,
    {
      chatId,
      name,
      description,
      link,
      subscribers,
      categories,
      channelDates,
      conditionCheck,
    }: Channel,
  ) {
    const categoriesNames = categories.map((category) => category.value);

    return await global.bot.sendMessage(
      adminId,
      MessagesChannel.REGISTRATION({
        name,
        description,
        link,
        subscribers,
        categories: categoriesNames,
        dates: channelDates,
        conditionCheck,
      }),
      useSendMessage({
        inline_keyboard: KeyboardChannel.AFTER_CREATE_CHANNEL(chatId),
      }),
    );
  }
}
