import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import { StatusStore } from '../status/StatusStore';
import type { ICreateSlot } from '../channels/types/types';
import type { IUpdateSlotStatusById } from './types/types';

@Injectable()
export class SlotsService {
  constructor(@InjectModel(Slots) private slotsRepository: typeof Slots) {}

  async createSlot({ timestamp, channelId, timestampFinish }: ICreateSlot) {
    const slot = await this.slotsRepository.create({
      timestamp,
      timestampFinish,
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
    });
  }

  async findOneBySlotId(id: number) {
    return await this.slotsRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  async updateSlotStatusById({ statusId, slotId }: IUpdateSlotStatusById) {
    await this.slotsRepository.update({ statusId }, { where: { id: slotId } });
  }
}
