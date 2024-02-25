import { BotService } from './bot.service';
import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { AuthModule } from '../auth/auth.module';
import { ChannelsModule } from '../channels/channels.module';

@Global()
@Module({
  controllers: [],
  providers: [BotService],
  exports: [],
  imports: [SequelizeModule.forFeature([Bot]), AuthModule, ChannelsModule],
})
export class BotModule {}
