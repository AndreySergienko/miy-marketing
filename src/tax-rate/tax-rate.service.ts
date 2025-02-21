import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TaxRate } from './tax-rate.model';

@Injectable()
export class TaxRateService {
  constructor(
    @InjectModel(TaxRate) private taxRateRepository: typeof TaxRate,
  ) {}

  // Получить все налоговых режимов
  public async getAllTaxRates(): Promise<TaxRate[]> {
    return await this.taxRateRepository.findAll();
  }

  // Получить налоговый режим
  public async getTaxRateById(taxRateId: number) {
    return await this.taxRateRepository.findOne({ where: { id: taxRateId } });
  }
}
