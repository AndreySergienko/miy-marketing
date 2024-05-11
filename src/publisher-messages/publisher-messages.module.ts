import { Module } from '@nestjs/common';
import { PublisherMessagesService } from './publisher-messages.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PublisherMessages } from './models/publisher-messages.model';
import { Slots } from '../slots/models/slots.model';

@Module({
  providers: [PublisherMessagesService],
  exports: [PublisherMessagesService],
  imports: [SequelizeModule.forFeature([PublisherMessages, Slots])],
})
export class PublisherMessagesModule {}
