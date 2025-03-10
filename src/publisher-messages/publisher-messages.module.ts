import { Module } from '@nestjs/common';
import { PublisherMessagesService } from './publisher-messages.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PublisherMessages } from './models/publisher-messages.model';
import { Advertisement } from 'src/advertisement/models/advertisement.model';

@Module({
  providers: [PublisherMessagesService],
  exports: [PublisherMessagesService],
  imports: [SequelizeModule.forFeature([PublisherMessages, Advertisement])],
})
export class PublisherMessagesModule {}
