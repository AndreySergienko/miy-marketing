import { Module } from '@nestjs/common';
import { PublisherMessagesService } from './publisher-messages.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PublisherMessages } from './models/publisher-messages.model';
import { Status } from '../status/models/status.model';

@Module({
  providers: [PublisherMessagesService],
  imports: [SequelizeModule.forFeature([PublisherMessages, Status])],
})
export class PublisherMessagesModule {}
