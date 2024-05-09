import { Injectable } from '@nestjs/common';
import { useSendMessage } from '../hooks/useSendMessage';
import { KeyboardChannel } from '../modules/extensions/bot/keyboard/KeyboardChannel';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';
import { Channel } from '../channels/models/channels.model';
import {
  convertTimestampToTime,
  convertUtcDateToFullDate,
} from '../utils/date';
import type {
  IBuyChannelMessage,
  IValidationCancelChannelDto,
  IValidationChannelDto,
} from '../channels/types/types';
import * as process from 'process';

@Injectable()
export class BotEvent {
  async sendInvoiceBuyAdvertising(chatId: number, dto: IBuyChannelMessage) {
    return await global.bot.sendInvoice(
      chatId,
      'Купить рекламу в канале',
      MessagesChannel.BUY_ADVERTISING(dto),
      `${dto.slotId}`,
      process.env.PAYMENT_TOKEN,
      'RUB',
      [
        {
          label: 'Покупка',
          amount: dto.price * 100,
        },
      ],
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

  async sendMessageAcceptChannel(chatId: number, dto: IValidationChannelDto) {
    return await global.bot.sendMessage(
      chatId,
      MessagesChannel.ACCEPT_REGISTRATION(dto),
    );
  }

  async sendMessageCancelChannel(
    chatId: number,
    dto: IValidationCancelChannelDto,
  ) {
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
      day,
      description,
      price,
      link,
      subscribers,
      categories,
      slots,
      formatChannel,
      conditionCheck,
    }: Channel,
  ) {
    const full_day = convertUtcDateToFullDate(+day);
    const categoriesNames = categories.map((category) => category.value);
    const slotDate = slots.map((slot) =>
      convertTimestampToTime(+slot.timestamp),
    );

    return await global.bot.sendMessage(
      adminId,
      MessagesChannel.REGISTRATION({
        name,
        day: full_day,
        description,
        price,
        link,
        subscribers,
        categories: categoriesNames,
        slots: slotDate,
        format: formatChannel.value,
        conditionCheck,
      }),
      useSendMessage({
        inline_keyboard: KeyboardChannel.AFTER_CREATE_CHANNEL(chatId),
      }),
    );
  }
}
