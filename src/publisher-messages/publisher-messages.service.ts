import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PublisherMessages } from './models/publisher-messages.model';
import { PublisherMessageCreateDto } from './types/types';

@Injectable()
export class PublisherMessagesService {
  constructor(
    @InjectModel(PublisherMessages)
    private publisherMessagesRepository: typeof PublisherMessages,
  ) {}

  async createMessage({ message, slotId, userId }: PublisherMessageCreateDto) {
    const msg = await this.publisherMessagesRepository.create({
      message,
      userId,
    });
    await msg.$set('slot', slotId);
    return msg;
  }

  public destroy(id) {
    return this.publisherMessagesRepository.destroy({ where: { id } });
  }
}
