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

export interface IPublishingMessages {
  /** админ канала */
  // adminId: number;
  /** рекламодателя */
  publisherId: number;
  channelName: string;
  channelDate: number;
}
