import type { User } from 'node-telegram-bot-api';

export interface BotModelAttrs {
  chatId: number;
  userId: number;
  date: number;
}

export interface IBotRequestDto {
  channelId: number;
  from: User;
  reason?: string;
}
