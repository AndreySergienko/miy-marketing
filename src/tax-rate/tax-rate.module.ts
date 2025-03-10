import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaxRate } from './tax-rate.model';

@Module({
  imports: [SequelizeModule.forFeature([TaxRate])],
})
export class TaxRateModule {}
