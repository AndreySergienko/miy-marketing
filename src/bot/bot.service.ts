import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import * as process from 'process';
import { mapMessage } from '../modules/extensions/bot/mapMessage';
import { AuthService } from '../auth/auth.service';
import { CallbackData } from '../modules/extensions/bot/callback.data';
import {
  hasToken,
  newToken,
} from '../modules/extensions/bot/messages/messages';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectModel(Bot) private botRepository: typeof Bot,
    private authService: AuthService,
  ) {
    global.bot = new TelegramBot(process.env.TOKEN_BOT, { polling: true });
  }

  async startBot() {
    global.bot.on(
      'callback_query',
      async ({ from, id, data }: TelegramBot.CallbackQuery) => {
        try {
          switch (data) {
            case CallbackData.GET_TOKEN:
              const { id, isAlready } =
                await this.authService.registrationInBot(from.id);
              const sendToken = async (cb: (id: string) => string) =>
                await global.bot.sendMessage(from.id, cb(String(id)));
              isAlready ? await sendToken(hasToken) : await sendToken(newToken);

              break;
          }

          await global.bot.answerCallbackQuery(id);
        } catch (e) {
          console.log(e);
        }
      },
    );

    // watch msg thread
    global.bot.on('message', async (message: TelegramBot.Message) => {
      if (mapMessage.has(message.text)) {
        await mapMessage.get(message.text)(message, this.authService);
      }
    });
  }

  async onModuleInit() {
    await this.startBot();
  }
}
