import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Channel } from '../channels/models/channels.model';
import { Status } from '../status/models/status.model';
import { PublisherMessages } from '../publisher-messages/models/publisher-messages.model';
import { AdvertisementService } from './advertisement.service';
import { Advertisement } from './models/advertisement.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Advertisement,
      Channel,
      Status,
      PublisherMessages,
    ]),
  ],
  providers: [AdvertisementService],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
