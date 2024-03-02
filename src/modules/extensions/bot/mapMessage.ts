import { useSendMessage } from '../../../hooks/useSendMessage';
import * as TelegramBot from 'node-telegram-bot-api';
import { AuthService } from '../../../auth/auth.service';
import { KeyboardAuthentication } from './keyboard/KeyboardAuthentication';
import { MessagesAuthentication } from './messages/MessagesAuthentication';

export const mapMessage = new Map([
  [
    '/start',
    async ({ chat }: TelegramBot.Message) => {
      await global.bot.sendMessage(
        chat.id,
        MessagesAuthentication.START,
        useSendMessage({
          inline_keyboard: KeyboardAuthentication.GET_TOKEN,
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
