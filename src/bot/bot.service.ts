import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import * as process from 'process';
import { mapMessage } from '../modules/extensions/bot/mapMessage';
import { AuthService } from '../auth/auth.service';
import { ChatMemberStatus } from 'node-telegram-bot-api';
import { ChannelsService } from '../channels/channels.service';
import { ChannelCreateDto } from '../channels/types/types';
import { MessagesAuthentication } from '../modules/extensions/bot/messages/MessagesAuthentication';
import { CallbackDataAuthentication } from '../modules/extensions/bot/callback-data/CallbackDataAuthentication';
import { CallbackDataChannel } from '../modules/extensions/bot/callback-data/CallbackDataChannel';
import { BotEvent } from './BotEvent';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectModel(Bot) private botRepository: typeof Bot,
    private authService: AuthService,
    private channelsService: ChannelsService,
    private botEvent: BotEvent,
  ) {
    // Если уже есть, то не создавать экземпляр
    global.bot = !global.bot
      ? new TelegramBot(process.env.TOKEN_BOT, { polling: true })
      : global.bot;
  }

  private connectAndKickedBot() {
    try {
      global.bot.on(
        'my_chat_member',
        async ({ chat, new_chat_member }: TelegramBot.ChatMemberUpdated) => {
          const leaveStatuses: ChatMemberStatus[] = ['kicked', 'left'];
          const joinStatus: ChatMemberStatus = 'administrator';

          const validChatType: TelegramBot.ChatType[] = ['channel', 'private'];
          // Мы работаем только с группами или приват группами
          if (!validChatType.includes(chat.type)) return;
          const chatId = chat.id;
          const currentBotStatus = new_chat_member.status;
          const channel = await this.channelsService.findOneByChatId(chatId);
          // Если статус связан с внедрением бота в канал
          if (joinStatus === currentBotStatus) {
            // В случае если прав недостаточно для бота, то удаляем его
            const isCanPostMessage = new_chat_member.can_post_messages;
            const subscribers = await global.bot.getChatMemberCount(chatId);
            const name = chat.title;
            const infoChat = await global.bot.getChat(chatId);
            const dto: ChannelCreateDto = {
              name,
              subscribers,
              chatId,
              isCanPostMessage,
              link: infoChat.invite_link,
              description: infoChat.description || '',
            };
            if (!channel) {
              await this.channelsService.createChannel(dto);
            } else {
              await this.channelsService.updateChannel(dto);
            }
          }
          if (leaveStatuses.includes(currentBotStatus) && channel) {
            await this.channelsService.removeChannel(chatId);
          }
        },
      );
    } catch (e) {
      console.log(e);
    }
  }

  async startBot() {
    this.connectAndKickedBot();
    global.bot.on(
      'callback_query',
      async ({ from, id, data }: TelegramBot.CallbackQuery) => {
        try {
          let code: string;
          let callbackId: number;

          if (data.includes(';')) {
            const partials = data.split(';');
            code = partials[0];
            callbackId = +partials[1];
          } else code = data;

          switch (code) {
            case CallbackDataAuthentication.GET_TOKEN:
              const { id, isAlready } =
                await this.authService.registrationInBot(from.id);
              const sendToken = async (cb: (id: string) => string) =>
                await global.bot.sendMessage(from.id, cb(String(id)));
              isAlready
                ? await sendToken(MessagesAuthentication.HAS_TOKEN)
                : await sendToken(MessagesAuthentication.NEW_TOKEN);

              break;

            case CallbackDataChannel.ACCEPT_HANDLER:
              await this.channelsService.acceptValidateChannel(callbackId);
              break;
            case CallbackDataChannel.CANCEL_HANDLER:
              await this.botEvent.sendMessageAdminFailChannel();
              break;
            case CallbackDataChannel.CHANGE_DESCRIPTION_HANDLER:
              // Отправка другого месседжа с кнопкой
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
