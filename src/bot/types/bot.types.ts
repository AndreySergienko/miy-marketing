import type { User } from 'node-telegram-bot-api';

export interface BotModelAttrs {
  chatId: number;
  userId: number;
  date: number;
}

export interface IBotRequestDto {
  id: number;
  from: User;
  text?: string;
}
