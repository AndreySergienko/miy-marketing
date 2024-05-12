import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Slots } from '../slots/models/slots.model';
import { StatusStore } from '../status/StatusStore';
import { Op } from 'sequelize';
import { convertDateTimeToMoscow, fifthMinuteLater } from '../utils/date';

@Injectable()
export class QueuesService {
  constructor(@InjectModel(Slots) private slotsRepository: typeof Slots) {}

  private findSlots(statusId: number) {
    return this.slotsRepository.findAll({
      where: {
        statusId,
        timestamp: {
          /** Дата публикации **/
          [Op.gt]: String(convertDateTimeToMoscow(Date.now())),
          /** Дата публикации с погрешностью в 1 минуту **/
          [Op.lt]: String(convertDateTimeToMoscow(fifthMinuteLater())),
        },
      },
      include: {
        all: true,
      },
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  public async actionMessages() {
    try {
      const activeSlots = await this.findSlots(StatusStore.PROCESS);
      for (let i = 0; i < activeSlots.length; i++) {
        const slot = activeSlots[i];
        await slot.$set('status', StatusStore.FINISH);
        const chatId = slot.channel.chatId;
        const text = await global.bot.sendMessage(chatId, slot.message.message);
        await slot.$set('messageBotId', text.message_id);
      }

      const finishedSlots = await this.findSlots(StatusStore.FINISH);

      for (let i = 0; i < finishedSlots.length; i++) {
        const slot = finishedSlots[i];
        await slot.$set('status', StatusStore.PUBLIC);
        const chatId = slot.channel.chatId;
        await global.bot.deleteMessage(chatId, slot.messageBotId);
      }
    } catch (e) {
      /** Отследить поведение отправки сообщений, если такое невозможно, тогда вернуть средства **/
      console.log(e);
    }
  }
}
