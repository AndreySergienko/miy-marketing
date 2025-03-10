import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserChannel } from './models/user-channel.model';
import { Channel } from './models/channels.model';
import { User } from '../user/models/user.model';
import { UserModule } from '../user/user.module';
import { Categories } from '../categories/models/categories.model';
import { Status } from '../status/models/status.model';
import { Slots } from '../slots/models/slots.model';
import { SlotsModule } from '../slots/slots.module';
import { FormatChannel } from './models/format-channel.model';
import { CategoriesChannel } from '../categories/models/categories-channel.model';
import { AdvertisementModule } from 'src/advertisement/advertisement.module';
import { Payment } from 'src/payments/models/payment.model';
import { ChannelDate } from './models/channel-dates.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Channel,
      ChannelDate,
      UserChannel,
      User,
      Categories,
      Status,
      Slots,
      FormatChannel,
      CategoriesChannel,
      Payment,
    ]),
    UserModule,
    SlotsModule,
    AdvertisementModule,
  ],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [ChannelsService],
})
export class ChannelsModule {}
