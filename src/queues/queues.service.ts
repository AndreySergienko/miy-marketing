import { BotService } from './../bot/bot.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { StatusStore } from '../status/StatusStore';
import { Op } from 'sequelize';
import {
  convertDateTimeToMoscow,
  fifthMinuteLater,
  hourLast,
  towMinuteLast,
} from '../utils/date';
import { UserService } from '../user/user.service';
import { BotEvent } from '../bot/BotEvent';
import { Advertisement } from 'src/advertisement/models/advertisement.model';
import { ChannelsService } from 'src/channels/channels.service';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';

@Injectable()
export class QueuesService {
  constructor(
    @InjectModel(Advertisement)
    private advertisementRepository: typeof Advertisement,
    private botService: BotService,
    private userService: UserService,
    private botEvent: BotEvent,
    private channelsService: ChannelsService,
  ) {}

  private async sendNotifications(
    slot: Advertisement,
    method: 'sendAfterPublicMessage' | 'sendAfterDeleteMessage',
  ) {
    const publisher = await this.userService.findOneById(slot.message.userId);
    const publisherId = publisher.chatId;
    const channelName = slot.channel.name;
    const channelDate = slot.timestamp;
    await this.botEvent[method]({
      publisherId,
      channelDate,
      channelName,
    });
  }

  private findSlots(statusId: number, key: 'timestamp' | 'timestampFinish') {
    return this.advertisementRepository.findAll({
      where: {
        statusId,
        // [key]: {
        //   /** Дата публикации **/
        //   [Op.gte]: String(convertDateTimeToMoscow(towMinuteLast())),
        //   /** Дата публикации с погрешностью в 1 минуту **/
        //   [Op.lte]: String(convertDateTimeToMoscow(fifthMinuteLater())),
        // },
      },
      include: {
        all: true,
      },
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES, {
    timeZone: 'Asia/Yekaterinburg',
  })
  public async actionMessages() {
    try {
      const finishedSlots = await this.findSlots(
        StatusStore.FINISH,
        'timestampFinish',
      );
      const moderators = await this.userService.getAllAdminsChatIds();

      for (let i = 0; i < finishedSlots.length; i++) {
        const slot = finishedSlots[i];
        const chatId = slot.channel.chatId;
        const user = await this.userService.findByChannelId(slot.channel.id);
        await global.bot.deleteMessage(chatId, slot.messageBotId);
        await this.advertisementRepository.destroy({
          where: { id: slot.id },
          cascade: true,
        });

        if (user) {
          const { bik, correspondentAccount, name, currentAccount } = user.bank;
          for (let i = 0; i < moderators.length; i++) {
            const moderator = moderators[i];
            await global.bot.sendMessage(
              moderator,
              MessagesChannel.sendCashAdminChannelAfterSuccessPost({
                fio: user.fio,
                inn: user.inn,
                nameBank: name,
                paymentAccount: currentAccount,
                price: String(slot.payment.price),
                bik,
                correspondentAccount,
              }),
            );
          }
        }

        if (user.isNotification) {
          await this.sendNotifications(
            slot,
            'sendAfterDeleteMessage',
            // user.chatId,
          );
        }
      }

      const activeSlots = await this.findSlots(
        StatusStore.PROCESS,
        'timestamp',
      );
      for (let i = 0; i < activeSlots.length; i++) {
        const slot = activeSlots[i];
        await slot.$set('status', StatusStore.FINISH);
        const chatId = slot.channel.chatId;
        const text = await global.bot.sendMessage(chatId, slot.message.message);
        const user = await this.userService.findByChannelId(slot.channel.id);
        await this.advertisementRepository.update(
          { messageBotId: text.message_id },
          { where: { id: slot.id } },
        );
        if (user.isNotification) {
          await this.sendNotifications(
            slot,
            'sendAfterPublicMessage',
            // user.chatId,
          );
        }
      }
    } catch (e) {
      /** Отследить поведение отправки сообщений, если такое невозможно, тогда вернуть средства **/
      console.log(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    timeZone: 'Asia/Yekaterinburg',
  })
  public async sendResetCash() {
    try {
      const invalidAdvertisements = await this.advertisementRepository.findAll({
        where: {
          statusId: StatusStore.FINISH,
          timestampFinish: {
            [Op.lte]: String(convertDateTimeToMoscow(hourLast())),
          },
        },
        include: { all: true },
      });

      await this.botService.sendMessageReset(invalidAdvertisements);
    } catch (e) {
      console.log(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: 'Asia/Yekaterinburg',
  })
  public async checkCancelChannel() {
    try {
      const channels = await this.channelsService.findAllPublic();
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];

        const isDateInvalid = channel.channelDates.every((date) => {
          const [day, month, year] = date.date.split('.');
          const timestamp = +new Date(`${month}/${day}/${year}`);
          return +new Date() > timestamp;
        });

        if (isDateInvalid) {
          await channel.$set('status', StatusStore.CANCEL);
          await global.bot.sendMessage(
            channel.users[0].chatId,
            `Уважаемый администратор!

Даты публикации канала ${channel.name} устарели, пожалуйста, обновите список актуальных дат.`,
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}
