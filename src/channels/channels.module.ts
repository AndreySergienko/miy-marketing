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

@Module({
  imports: [
    SequelizeModule.forFeature([
      Channel,
      UserChannel,
      User,
      Categories,
      Status,
      Slots,
    ]),
    UserModule,
  ],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [ChannelsService],
})
export class ChannelsModule {}
