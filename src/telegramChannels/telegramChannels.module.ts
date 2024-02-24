import { Module } from '@nestjs/common';
import { TelegramChannelsController } from './telegramChannels.controller';
import { TelegramChannelsService } from './telegramChannels.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { TelegramChannels } from './models/telegramChannels.model';
import { TelegramChannelsCategories } from './models/telegramChannelsCategories.model';

@Module({
  imports: [
    SequelizeModule.forFeature([TelegramChannels, TelegramChannelsCategories]),
  ],
  providers: [TelegramChannelsService],
  controllers: [TelegramChannelsController],
})
export class TelegramChannelsModule {}
