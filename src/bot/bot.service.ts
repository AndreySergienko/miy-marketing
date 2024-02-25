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
import { ChatMemberStatus } from 'node-telegram-bot-api';
import { ChannelsService } from '../channels/channels.service';
import { ChannelCreateDto } from '../channels/types/types';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectModel(Bot) private botRepository: typeof Bot,
    private authService: AuthService,
    private channelsService: ChannelsService,
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

          const validChatType = 'channel';
          // Мы работаем только с группами или приват группами
          if (validChatType !== chat.type) return;
          const chatId = chat.id;
          const currentBotStatus = new_chat_member.status;
          const channel = await this.channelsService.findOneByChatId(chatId);
          // Если статус связан с внедрением бота в канал
          if (joinStatus === currentBotStatus) {
            // В случае если прав недостаточно для бота, то удаляем его
            const isCanPostMessage = new_chat_member.can_post_messages;
            const subscribers = await global.bot.getChatMemberCount(chatId);
            const name = chat.title;
            const dto: ChannelCreateDto = {
              name,
              subscribers,
              chatId,
              isCanPostMessage,
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
          // }
          // {
          //   chat: { id: -1002025797650, title: 'TestChannel', type: 'channel' },
          //   from: {
          //     id: 1122463821,
          //       is_bot: false,
          //       first_name: 'Andrey',
          //       last_name: 'Sergienko',
          //       username: 'ensine',
          //       language_code: 'ru',
          //       is_premium: true
          //   },
          //   date: 1708850918,
          //     old_chat_member: {
          //   user: {
          //     id: 6394072314,
          //       is_bot: true,
          //       first_name: 'MIY-ADVERST',
          //       username: 'miy_ad_bot'
          //   },
          //   status: 'left'
          // },
          //   new_chat_member: {
          //     user: {
          //       id: 6394072314,
          //         is_bot: true,
          //         first_name: 'MIY-ADVERST',
          //         username: 'miy_ad_bot'
          //     },
          //     status: 'administrator',
          //       can_be_edited: false,
          //       can_manage_chat: true,
          //       can_change_info: false,
          //       can_post_messages: true,
          //       can_edit_messages: true,
          //       can_delete_messages: true,
          //       can_invite_users: false,
          //       can_restrict_members: true,
          //       can_promote_members: false,
          //       can_manage_video_chats: false,
          //       can_post_stories: false,
          //       can_edit_stories: false,
          //       can_delete_stories: false,
          //       is_anonymous: false,
          //       can_manage_voice_chats: false
          //   }
          // }
          // status ok - добавить бота в таблицу channels chatId
          // kick - отключить chatId

          // {
          //   chat: { id: -1002025797650, title: 'TestChannel', type: 'channel' },
          //   from: {
          //     id: 136817688,
          //       is_bot: true,
          //       first_name: 'Channel',
          //       username: 'Channel_Bot'
          //   },
          //   date: 1708850305,
          //     old_chat_member: {
          //   user: {
          //     id: 6394072314,
          //       is_bot: true,
          //       first_name: 'MIY-ADVERST',
          //       username: 'miy_ad_bot'
          //   },
          //   status: 'administrator',
          //     can_be_edited: false,
          //     can_manage_chat: true,
          //     can_change_info: true,
          //     can_post_messages: true,
          //     can_edit_messages: true,
          //     can_delete_messages: true,
          //     can_invite_users: true,
          //     can_restrict_members: true,
          //     can_promote_members: false,
          //     can_manage_video_chats: true,
          //     can_post_stories: false,
          //     can_edit_stories: false,
          //     can_delete_stories: false,
          //     is_anonymous: false,
          //     can_manage_voice_chats: true
          // },
          //   new_chat_member: {
          //     user: {
          //       id: 6394072314,
          //         is_bot: true,
          //         first_name: 'MIY-ADVERST',
          //         username: 'miy_ad_bot'
          //     },
          //     status: 'left'
          //   }
          // }
        },
      );
    } catch (e) {
      console.log(e);
    }
  }

  private chatConnect() {
    try {
      // global.bot.on('contact', (e) => {
      //   console.log('contact', e);
      // });
      // global.bot.on('delete_chat_photo', (e) => {
      //   console.log('delete_chat_photo', e);
      // });
      // global.bot.on('document', (e) => {
      //   console.log('document', e);
      // });
      // global.bot.on('game', (e) => {
      //   console.log('game', e);
      // });
      // global.bot.on('group_chat_created', (e) => {
      //   console.log('group_chat_created', e);
      // });
      // global.bot.on('invoice', (e) => {
      //   console.log('invoice', e);
      // });
      // global.bot.on('left_chat_member', (e) => {
      //   console.log('left_chat_member', e);
      // });
      // global.bot.on('location', (e) => {
      //   console.log('location', e);
      // });
      // global.bot.on('migrate_from_chat_id', (e) => {
      //   console.log('migrate_from_chat_id', e);
      // });
      // global.bot.on('migrate_to_chat_id', (e) => {
      //   console.log('migrate_to_chat_id', e);
      // });
      // global.bot.on('new_chat_members', (e) => {
      //   console.log('new_chat_members', e);
      // });
      // global.bot.on('passport_data', (e) => {
      //   console.log('passport_data', e);
      // });
      // global.bot.on('photo', (e) => {
      //   console.log('photo', e);
      // });
      // global.bot.on('pinned_message', (e) => {
      //   console.log('pinned_message', e);
      // });
      // global.bot.on('sticker', (e) => {
      //   console.log('sticker', e);
      // });
      // global.bot.on('chosen_inline_result', (e) => {
      //   console.log('chosen_inline_result', e);
      // });
      //
      // global.bot.on('channel_post', (t) => {
      //   console.log('channel_post', t);
      // });
      // global.bot.on('pre_checkout_query', (t) => console.log('t', t));
      // global.bot.on('chat_join_request', (t) => console.log('t', t));
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
    await this.chatConnect();
  }
}
