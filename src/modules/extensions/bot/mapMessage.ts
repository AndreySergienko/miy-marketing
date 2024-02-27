import { useSendMessage } from '../../../hooks/useSendMessage';
import { btnGetToken } from './keyboard/keyboard';
import { startMessage } from './messages/messages';
import * as TelegramBot from 'node-telegram-bot-api';
import { AuthService } from '../../../auth/auth.service';

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
  [
    '/help password',
    async ({ chat }: TelegramBot.Message, service: AuthService) => {
      await service.resetPassword(chat.id);
    },
  ],
]);
