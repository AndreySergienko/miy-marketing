import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import type { ICreateSlot } from '../channels/types/types';

@Injectable()
export class SlotsService {
  constructor(@InjectModel(Slots) private slotsRepository: typeof Slots) {}

  async createSlot({ timestamp, channelDateId }: ICreateSlot) {
    const slot = await this.slotsRepository.create({
      timestamp,
    });
    await slot.$set('channelDate', channelDateId);
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
    return await this.slotsRepository.findAll({ where: { channelDateId } });
  }
}
