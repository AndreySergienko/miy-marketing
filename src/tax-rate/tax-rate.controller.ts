import { Controller, Get } from '@nestjs/common';
import { TaxRateService } from './tax-rate.service';
import { TaxRate } from './tax-rate.model';

@Controller('tax-rate')
export class TaxRateController {
  constructor(private readonly taxRateService: TaxRateService) {}

  // Получить все налоговые режимы
  @Get()
  public async getAllTaxRates(): Promise<TaxRate[]> {
    return await this.taxRateService.getAllTaxRates();
  }
}
