import { Controller, Get, Query, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import type { IQueryPagination } from '../database/pagination.types';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  async deleteCard() {
    return await this.paymentsService;
  }

  @Get('all')
  async getAll(@Query() pagination: IQueryPagination, @Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error;
    const userId = req.user.id;
    if (typeof userId !== 'number') return;
    return await this.paymentsService.getAll(pagination, userId);
  }
}
