import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { SequelizeModule } from '@nestjs/sequelize';
import SqlDatabase from './database/samples/SqlDatabase';
import { QueuesModule } from './queues/queues.module';
import { Slots } from './slots/models/slots.model';
import { SlotsModule } from './slots/slots.module';
import { Channel } from './channels/models/channels.model';
import { Status } from './status/models/status.model';
import { Payment } from './payments/models/payment.model';
import { PublisherMessages } from './publisher-messages/models/publisher-messages.model';
import { UserChannel } from './channels/models/user-channel.model';
import { User } from './user/models/user.model';
import { CategoriesChannel } from './categories/models/categories-channel.model';
import { Categories } from './categories/models/categories.model';
import { Permission } from './permission/models/persmissions.model';
import { UserPermission } from './permission/models/user-permission.model';
import { Mail } from './nodemailer/model/nodemailer.model';
import { FormatChannel } from './channels/models/format-channel.model';
import { UserPayment } from './payments/models/user-payment.model';
import { Card } from './payments/models/card.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.envs/.${process.env.STAND}.env`,
    }),
    SequelizeModule.forRoot(
      new SqlDatabase().connect([
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
    QueuesModule,
    SlotsModule,
  ],
  providers: [],
})
export class WorkerModule {}
