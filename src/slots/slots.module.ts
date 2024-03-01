import { Module } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import { Channel } from '../channels/models/channels.model';
import { Status } from '../status/models/status.model';
import { PublisherMessages } from '../publisher-messages/models/publisher-messages.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Slots, Channel, Status, PublisherMessages]),
  ],
  providers: [SlotsService],
})
export class SlotsModule {}
