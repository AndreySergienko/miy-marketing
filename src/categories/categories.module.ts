import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Categories } from './models/categories.model';

@Module({
  providers: [CategoriesService],
  imports: [SequelizeModule.forFeature([Categories])],
})
export class CategoriesModule {}
