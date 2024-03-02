import { BotService } from './bot.service';
import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { AuthModule } from '../auth/auth.module';
import { ChannelsModule } from '../channels/channels.module';
import { BotEvent } from './BotEvent';

@Global()
@Module({
  controllers: [],
  providers: [BotService, BotEvent],
  exports: [BotEvent],
  imports: [SequelizeModule.forFeature([Bot]), AuthModule, ChannelsModule],
})
export class BotModule {}
