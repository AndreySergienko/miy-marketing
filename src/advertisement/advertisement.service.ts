import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StatusStore } from '../status/StatusStore';
import { Advertisement } from './models/advertisement.model';
import { IUpdateStatusById } from './types/types';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectModel(Advertisement)
    private advertisementRepository: typeof Advertisement,
  ) {}

  async createAdvertisement({ timestamp, channelId, timestampFinish }) {
    const advertisement = await this.advertisementRepository.create({
      timestamp,
      timestampFinish,
    });
    await advertisement.$set('status', StatusStore.CREATE);
    await advertisement.$set('channel', channelId);
  }

  async destroy(id: number) {
    await this.advertisementRepository.destroy({ where: { id } });
  }

  async removeAdvertisement(channelId: number) {
    await this.advertisementRepository.destroy({ where: { channelId } });
  }

  async findActive(channelId: number) {
    return await this.advertisementRepository.findAll({
      where: { channelId, status: StatusStore.FINISH },
    });
  }

  async findOneById(id: number) {
    return await this.advertisementRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  async updateStatusById({ statusId, slotId }: IUpdateStatusById) {
    await this.advertisementRepository.update(
      { statusId },
      { where: { id: slotId } },
    );
  }
}
