import { Module } from '@nestjs/common';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import SqlDatabase from './database/samples/SqlDatabase';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModule } from './bot/bot.module';
import { Bot } from './bot/models/bot.model';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/models/user.model';
import { UserPermission } from './permission/models/user-permission.model';
import { Permission } from './permission/models/persmissions.model';
import { PermissionModule } from './permission/permission.module';
import { NodemailerModule } from './nodemailer/nodemailer.module';
import { Mail } from './nodemailer/model/nodemailer.model';
import { StatusModule } from './status/status.module';
import { Status } from './status/models/status.model';
import { CategoriesModule } from './categories/categories.module';
import { Categories } from './categories/models/categories.model';
import { ChannelsModule } from './channels/channels.module';
import { Channel } from './channels/models/channels.model';
import { UserChannel } from './channels/models/user-channel.model';
import { CategoriesChannel } from './categories/models/categories-channel.model';
import { Slots } from './slots/models/slots.model';
import { SlotsModule } from './slots/slots.module';
import { PublisherMessagesModule } from './publisher-messages/publisher-messages.module';
import { PublisherMessages } from './publisher-messages/models/publisher-messages.model';
import { FormatChannel } from './channels/models/format-channel.model';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/models/payment.model';
import { UserPayment } from './payments/models/user-payment.model';
import { Card } from './payments/models/card.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.envs/.${process.env.STAND}.env`,
    }),
    SequelizeModule.forRoot(
      new SqlDatabase().connect([
        Bot,
        User,
        Permission,
        UserPermission,
        Mail,
        Status,
        Categories,
        CategoriesChannel,
        Channel,
        UserChannel,
        Slots,
        PublisherMessages,
        FormatChannel,
        Payment,
        UserPayment,
        Card,
      ]),
    ),
    BotModule,
    UserModule,
    AuthModule,
    PermissionModule,
    NodemailerModule,
    StatusModule,
    CategoriesModule,
    ChannelsModule,
    SlotsModule,
    PublisherMessagesModule,
    PaymentsModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
