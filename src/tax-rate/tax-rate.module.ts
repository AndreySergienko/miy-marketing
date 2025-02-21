import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaxRate } from './tax-rate.model';
import { TaxRateService } from './tax-rate.service';
import { TaxRateController } from './tax-rate.controller';

@Module({
  imports: [SequelizeModule.forFeature([TaxRate])],
  controllers: [TaxRateController],
  providers: [TaxRateService],
  exports: [TaxRateService],
})
export class TaxRateModule {}
