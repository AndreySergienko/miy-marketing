import { Module } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import { ChannelDate } from 'src/channels/models/channel-dates.model';
import { FormatChannel } from 'src/channels/models/format-channel.model';

@Module({
  imports: [SequelizeModule.forFeature([Slots, ChannelDate, FormatChannel])],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
