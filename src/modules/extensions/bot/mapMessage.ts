import { useSendMessage } from '../../../hooks/useSendMessage';
import { btnGetToken } from './keyboard/keyboard';
import { startMessage } from './messages/messages';
import * as TelegramBot from 'node-telegram-bot-api';

export const mapMessage = new Map([
  [
    '/start',
    async ({ chat }: TelegramBot.Message) => {
      await global.bot.sendMessage(
        chat.id,
        startMessage,
        useSendMessage({
          inline_keyboard: btnGetToken,
        }),
      );
    },
  ],
]);
