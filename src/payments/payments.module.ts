import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { User } from '../user/models/user.model';
import { UserPayment } from './models/user-payment.model';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Status } from '../status/models/status.model';
import { ChannelsModule } from '../channels/channels.module';
import { Advertisement } from 'src/advertisement/models/advertisement.model';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    SequelizeModule.forFeature([
      Payment,
      User,
      Advertisement,
      UserPayment,
      Status,
    ]),
    ChannelsModule,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
