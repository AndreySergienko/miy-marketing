import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import * as process from 'process';
import { mapMessage } from '../modules/extensions/bot/mapMessage';
import { AuthService } from '../auth/auth.service';
import { ChatMemberStatus } from 'node-telegram-bot-api';
import { ChannelsService } from '../channels/channels.service';
import { ChannelCreateDto } from '../channels/types/types';
import { UserService } from '../user/user.service';
import { BotRequestService } from './bot-request.service';
import { StatusStore } from '../status/StatusStore';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private channelsService: ChannelsService,
    private botRequestService: BotRequestService,
    private userService: UserService,
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
            // Для получении фотографии
            let photo: string | undefined;
            if (infoChat.photo?.big_file_id) {
              const link = await global.bot.getFileLink(
                infoChat.photo.big_file_id,
              );
              photo = link.split('/file/')[1];
            }
            const dto: ChannelCreateDto = {
              avatar: photo,
              name,
              subscribers,
              chatId,
              isCanPostMessage,
              link: infoChat.invite_link,
              description: infoChat.description || '',
            };
            if (!channel) {
              const newChannel = await this.channelsService.createChannel(dto);
              await newChannel.$set('status', StatusStore.CREATE);
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
          const { code, channelId } = this.getCodeAndCallbackId(data);
          await this.botRequestService[code]({ from, id: channelId });
          await global.bot.answerCallbackQuery(id);
        } catch (e) {
          console.log(e);
        }
      },
    );

    global.bot.on(
      'pre_checkout_query',
      async (query: TelegramBot.PreCheckoutQuery) => {
        try {
          await this.botRequestService.checkBuyAdvertising(query);
        } catch (e) {
          console.log(e);
        }
      },
    );

    global.bot.on('successful_payment', async (msg: TelegramBot.Message) => {
      try {
        await this.botRequestService.afterBuyAdvertising(msg);
      } catch (e) {
        console.log(e);
      }
    });

    // watch msg thread
    global.bot.on('message', async (message: TelegramBot.Message) => {
      try {
        const user = await this.userService.findUserByChatId(message.chat.id);
        // Есть ли последнее событие юзера в классе обработчике
        if (user && user.lastActiveBot) {
          const { code, channelId } = this.getCodeAndCallbackId(
            user.lastActiveBot,
          );

          await this.botRequestService[code]({
            from: message.from,
            id: channelId,
            text: message.text,
          });
          return;
        }

        if (mapMessage.has(message.text)) {
          await mapMessage.get(message.text)(message, this.authService);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  private getCodeAndCallbackId(data?: string) {
    let code: string;
    let channelId: number;

    if (data.includes(':')) {
      const partials = data.split(':');
      code = partials[0];
      channelId = +partials[1];
    } else code = data;

    return {
      code,
      channelId,
    };
  }

  async onModuleInit() {
    await this.startBot();
  }
}
