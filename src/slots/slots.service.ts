import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import { StatusStore } from '../status/StatusStore';

@Injectable()
export class SlotsService {
  constructor(@InjectModel(Slots) private slotsRepository: typeof Slots) {}

  async createSlot(timestamp: number, channelId: number) {
    const slot = await this.slotsRepository.create({
      timestamp,
    });
    await slot.$set('status', StatusStore.CREATE);
    await slot.$set('channel', channelId);
  }

  async removeSlots(channelId: number) {
    return await this.slotsRepository.destroy({
      where: { channelId, statusId: StatusStore.CREATE },
    });
  }

  async findAllSlotByChannelId(channelId: number) {
    return await this.slotsRepository.findAll({
      where: { channelId },
      include: { all: true },
    });
  }

  async findOneBySlotId(id: number) {
    return await this.slotsRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  async updateSlotStatusById(slotId: number, statusId: number) {
    await this.slotsRepository.update({ statusId }, { where: { id: slotId } });
  }
}
