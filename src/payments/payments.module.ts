import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { User } from '../user/models/user.model';
import { Slots } from '../slots/models/slots.model';
import { UserPayment } from './models/user-payment.model';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Status } from '../status/models/status.model';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    SequelizeModule.forFeature([Payment, User, Slots, UserPayment, Status]),
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
