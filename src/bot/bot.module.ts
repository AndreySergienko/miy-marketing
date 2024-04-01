import { BotService } from './bot.service';
import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { AuthModule } from '../auth/auth.module';
import { ChannelsModule } from '../channels/channels.module';
import { BotEvent } from './BotEvent';
import { UserModule } from '../user/user.module';
import { BotRequestService } from './bot-request.service';
import { SlotsModule } from '../slots/slots.module';
import { PaymentsModule } from '../payments/payments.module';
import { PublisherMessagesModule } from '../publisher-messages/publisher-messages.module';

@Global()
@Module({
  controllers: [],
  providers: [BotService, BotEvent, BotRequestService],
  exports: [BotEvent],
  imports: [
    SequelizeModule.forFeature([Bot]),
    AuthModule,
    ChannelsModule,
    UserModule,
    SlotsModule,
    PaymentsModule,
    PublisherMessagesModule,
  ],
})
export class BotModule {}
