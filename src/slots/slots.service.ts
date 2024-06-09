import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import type { ICreateSlot } from '../channels/types/types';

@Injectable()
export class SlotsService {
  constructor(@InjectModel(Slots) private slotsRepository: typeof Slots) {}

  async createSlot({ timestamp, channelId }: ICreateSlot) {
    const slot = await this.slotsRepository.create({
      timestamp,
    });
    await slot.$set('channel', channelId);
  }

  async removeSlots(channelId: number) {
    return await this.slotsRepository.destroy({
      where: { channelId },
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

  async findAllByChannelId(channelId: number) {
    return await this.slotsRepository.findAll({ where: { channelId } });
  }
}
