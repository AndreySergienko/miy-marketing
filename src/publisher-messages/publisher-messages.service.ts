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

  async findById(messageId: number) {
    return await this.publisherMessagesRepository.findOne({
      where: { id: messageId },
    });
  }

  async createMessage({ message, slotId, userId }: PublisherMessageCreateDto) {
    const msg = await this.publisherMessagesRepository.create({
      message,
      userId,
    });
    await msg.$set('slot', slotId);
    return msg;
  }

  public destroy(id: number) {
    return this.publisherMessagesRepository.destroy({ where: { id } });
  }

  public updateMessage(id: number, message: string) {
    return this.publisherMessagesRepository.update(
      { message },
      { where: { id } },
    );
  }
}
