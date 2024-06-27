import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { pagination } from '../database/pagination';
import type { IQueryPagination } from '../database/pagination.types';
import { UserPayment } from './models/user-payment.model';
import { PaymentCreateDto, PaymentResponseDto } from './types/types';
import { StatusStore } from '../status/StatusStore';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment) private paymentRepository: typeof Payment,
    @InjectModel(UserPayment) private userPaymentRepository: typeof UserPayment,
    private channelService: ChannelsService,
  ) {}

  async addPayment({ price, slotId, userId }: PaymentCreateDto) {
    const payment = await this.paymentRepository.create({ price });
    await payment.$set('advertisement', slotId);
    await payment.$set('status', StatusStore.PAID);
    await payment.$set('user', userId);
  }

  async cancelPayment() {
    // TODO вернуть средства на карту
  }

  async getAll({ page = '1', size = '10' }: IQueryPagination, userId: number) {
    const userPayments = await this.userPaymentRepository.findAll({
      ...pagination({ page, size }),
      where: {
        userId: userId,
      },
    });
    const ids = userPayments.map((userPayment) => userPayment.paymentId);
    const payments = await this.paymentRepository.findAll({
      where: {
        id: ids,
      },
      include: { all: true },
    });
    const list: PaymentResponseDto[] = [];
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const channelSlot = await this.channelService.findById(
        payment.advertisement.channelId,
      );
      const datetime = payment.advertisement.timestamp;
      const channel = {
        name: channelSlot.name,
      };
      list.push({
        statusId: payment.statusId,
        price: payment.price,
        datetime,
        channel,
      });
    }

    return list;
  }

  async findPaymentBySlotId(advertisementId: number) {
    return await this.paymentRepository.findOne({
      where: { advertisementId },
    });
  }
}
