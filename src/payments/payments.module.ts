import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { User } from '../user/models/user.model';
import { Slots } from '../slots/models/slots.model';
import { UserPayment } from './models/user-payment.model';
import { SlotPayment } from './models/slot-payment.model';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    SequelizeModule.forFeature([
      Payment,
      User,
      Slots,
      UserPayment,
      SlotPayment,
    ]),
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
