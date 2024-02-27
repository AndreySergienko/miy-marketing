import type { InlineKeyboardButton } from 'node-telegram-bot-api';
import { btnToMessage } from '../messages/messages';
import { CallbackData } from '../callback.data';

export const btnGetToken: InlineKeyboardButton[][] = [
  [{ text: btnToMessage, callback_data: CallbackData.GET_TOKEN }],
];
