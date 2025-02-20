import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TaxRate } from './tax-rate.model';

@Injectable()
export class TaxRateService {
  constructor(
    @InjectModel(TaxRate) private taxRateRepository: typeof TaxRate,
  ) {}

  // Метод для получения всех налоговых режимов
  public async getAllTaxRates(): Promise<TaxRate[]> {
    return await this.taxRateRepository.findAll();
  }
}
