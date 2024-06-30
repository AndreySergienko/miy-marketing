import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/models/user.model';
import { UserModule } from '../user/user.module';
import { AdvertisementModule } from 'src/advertisement/advertisement.module';
import { Advertisement } from 'src/advertisement/models/advertisement.model';
import { BotModule } from 'src/bot/bot.module';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  providers: [QueuesService],
  imports: [
    SequelizeModule.forFeature([User, Advertisement]),
    UserModule,
    AdvertisementModule,
    BotModule,
    ChannelsModule,
  ],
})
export class QueuesModule {}
