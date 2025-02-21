import { Controller, Get } from '@nestjs/common';
import { TaxRateService } from './tax-rate.service';
import { TaxRate } from './tax-rate.model';
import { Public } from 'src/auth/decorators/public-auth.decorator';

@Controller('tax-rate')
export class TaxRateController {
  constructor(private readonly taxRateService: TaxRateService) {}

  // Получить все налоговые режимы
  @Public()
  @Get()
  public async getAllTaxRates(): Promise<TaxRate[]> {
    return await this.taxRateService.getAllTaxRates();
  }
}
