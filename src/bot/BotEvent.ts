import { Injectable } from '@nestjs/common';
import { useSendMessage } from '../hooks/useSendMessage';
import { KeyboardChannel } from '../modules/extensions/bot/keyboard/KeyboardChannel';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';
import { Channel } from '../channels/models/channels.model';
import {
  convertTimestampToTimeMoscow,
  convertUtcDateToFullDateMoscow,
} from '../utils/date';

@Injectable()
export class BotEvent {
  async getAdministrators(chatId: number) {
    return await global.bot.getChatAdministrators(chatId);
  }

  async sendMessageAdminFailChannel() {}

  async sendMessageAdminAfterCreateChannel(
    chatId: number,
    {
      name,
      day,
      description,
      price,
      link,
      subscribers,
      categories,
      slots,
    }: Channel,
  ) {
    const full_day = convertUtcDateToFullDateMoscow(day);
    const categoriesNames = categories.map((category) => category.value);
    const slotDate = slots.map((slot) =>
      convertTimestampToTimeMoscow(slot.timestamp),
    );

    return await global.bot.sendMessage(
      chatId,
      MessagesChannel.REGISTRATION({
        name,
        day: full_day,
        description,
        price,
        link,
        subscribers,
        categories: categoriesNames,
        slots: slotDate,
      }),
      useSendMessage({
        inline_keyboard: KeyboardChannel.AFTER_CREATE_CHANNEL(chatId),
      }),
    );
  }
}
