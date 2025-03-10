import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import type { ICreateSlot } from '../channels/types/types';

@Injectable()
export class SlotsService {
  constructor(@InjectModel(Slots) private slotsRepository: typeof Slots) {}

  async createSlot({
    timestamp,
    price,
    formatChannel,
    channelDateId,
    minutes,
  }: ICreateSlot) {
    const oldSlot = await this.slotsRepository.findOne({
      where: {
        timestamp,
        channelDateId,
        minutes,
      },
    });

    if (oldSlot) return;

    const slot = await this.slotsRepository.create({
      timestamp,
      price,
      minutes,
    });

    await slot.$set('formatChannel', formatChannel);
    await slot.$set('channelDate', channelDateId);
  }

  async removeSlotsById(id: number[]) {
    return await this.slotsRepository.destroy({
      where: { id },
    });
  }

  async removeSlots(channelDateId: number) {
    return await this.slotsRepository.destroy({
      where: { channelDateId },
    });
  }

  async findOneBySlotId(id: number) {
    return await this.slotsRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  async findAllByChannelDateId(channelDateId: number) {
    return await this.slotsRepository.findAll({
      where: { channelDateId },
      include: { all: true },
    });
  }
}
