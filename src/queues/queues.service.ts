import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Slots } from '../slots/models/slots.model';
import { StatusStore } from '../status/StatusStore';
import { Op } from 'sequelize';
import {
  convertDateTimeToMoscow,
  fifthMinuteLater,
  towMinuteLast,
} from '../utils/date';
import { UserService } from '../user/user.service';
import { BotEvent } from '../bot/BotEvent';
import { User } from '../user/models/user.model';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';

@Injectable()
export class QueuesService {
  constructor(
    @InjectModel(Slots) private slotsRepository: typeof Slots,
    @InjectModel(User) private usersRepository: typeof User,
    private userService: UserService,
    private botEvent: BotEvent,
  ) {}

  private async sendNotifications(
    slot: Slots,
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

  private findSlots(statusId: number) {
    return this.slotsRepository.findAll({
      where: {
        statusId,
        timestamp: {
          /** Дата публикации **/
          [Op.gte]: String(convertDateTimeToMoscow(towMinuteLast())),
          /** Дата публикации с погрешностью в 1 минуту **/
          [Op.lte]: String(convertDateTimeToMoscow(fifthMinuteLater())),
        },
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
      const finishedSlots = await this.findSlots(StatusStore.FINISH);
      for (let i = 0; i < finishedSlots.length; i++) {
        const slot = finishedSlots[i];
        const chatId = slot.channel.chatId;
        const user = await this.userService.findByChannelId(slot.channel.id);
        await global.bot.deleteMessage(chatId, slot.messageBotId);
        await this.slotsRepository.destroy({ where: { id: slot.id } });
        if (user.isNotification) {
          await this.sendNotifications(
            slot,
            'sendAfterDeleteMessage',
            // user.chatId,
          );
        }
      }

      const activeSlots = await this.findSlots(StatusStore.PROCESS);
      for (let i = 0; i < activeSlots.length; i++) {
        const slot = activeSlots[i];
        await slot.$set('status', StatusStore.FINISH);
        const chatId = slot.channel.chatId;
        const text = await global.bot.sendMessage(chatId, slot.message.message);
        const user = await this.userService.findByChannelId(slot.channel.id);
        await this.slotsRepository.update(
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
      const invalidSlots = await this.slotsRepository.findAll({
        where: { statusId: StatusStore.FINISH },
        include: { all: true },
      });

      for (let i = 0; i < invalidSlots.length; i++) {
        const invalidSlot = invalidSlots[i];
        const publisher = await this.userService.findOneById(
          invalidSlot.message.userId,
        );

        const info = {
          price: invalidSlot.payment.price,
          email: publisher.email,
          card: publisher.card.number,
          id: invalidSlot.id,
          fio: publisher.fio,
        };

        if (invalidSlot.timestampFinish < Date.now()) {
          await this.slotsRepository.destroy({ where: { id: invalidSlot.id } });
        }

        const admins = await this.userService.getAllAdmins();
        await global.bot.sendMessage(
          admins[0].chatId,
          MessagesChannel.RESET_CASH(info),
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
}
