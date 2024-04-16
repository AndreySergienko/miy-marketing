import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { pagination } from '../database/pagination';
import type { IQueryPagination } from '../database/pagination.types';
import { UserPayment } from './models/user-payment.model';
import { PaymentCreateDto } from './types/types';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment) private paymentRepository: typeof Payment,
    @InjectModel(UserPayment) private userPaymentRepository: typeof UserPayment,
  ) {}

  async addPayment({ price, slotId, userId }: PaymentCreateDto) {
    const payment = await this.paymentRepository.create({ price });
    await payment.$set('slot', slotId);
    await payment.$set('user', userId);
  }

  async cancelPayment() {
    // TODO вернуть средства на карту
    console.log('Когда надо сделать вывод');
  }

  async removePayment() {}

  async updatePayment() {}

  async getAll({ page = '1', size = '10' }: IQueryPagination, userId: number) {
    const userPayments = await this.userPaymentRepository.findAll({
      ...pagination({ page, size }),
      where: {
        id: userId,
      },
    });

    const ids = userPayments.map((userPayment) => userPayment.paymentId);
    return await this.paymentRepository.findAll({
      where: {
        id: ids,
      },
      include: { all: true },
    });
  }
}
