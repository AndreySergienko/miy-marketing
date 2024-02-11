import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { useSendMessage } from '../hooks/useSendMessage';
import { btnActions } from '../utils/keyboard';
import { validateMsg } from '../utils/messages';
import * as process from 'process';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectModel(Bot) private botRepository: typeof Bot,
    private authService: AuthService,
  ) {
    global.bot = new TelegramBot(process.env.TOKEN_BOT, { polling: true });
  }

  async startBot() {
    // watch chat request thread
    global.bot.on(
      'chat_join_request',
      async ({
        user_chat_id,
        chat,
        date,
        from,
      }: TelegramBot.ChatJoinRequest) => {
        try {
          const userId = user_chat_id;
          const isInclude = await this.botRepository.findOne({
            where: { userId },
          });
          const chatId = chat.id;
          if (isInclude) {
            await this.botRepository.update(
              { chatId, userId, date },
              { where: { userId } },
            );
          } else {
            await this.botRepository.create({ userId, date, chatId });
          }
          const login = from.first_name || from.last_name || from.username;
          await global.bot.sendMessage(
            userId,
            validateMsg(login),
            useSendMessage({
              keyboard: btnActions,
              remove_keyboard: true,
              resize_keyboard: true,
            }),
          );
        } catch (e) {
          console.log(e);
        }
      },
    );

    // watch msg thread
    global.bot.on('message', async ({ text, chat }: TelegramBot.Message) => {
      if (text === 'Рег') {
        await this.authService.registrationInBot(chat.id);
      }
    });
  }

  async onModuleInit() {
    await this.startBot();
  }
}
