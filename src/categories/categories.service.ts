import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Categories } from './models/categories.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories) private categoriesRepository: typeof Categories,
  ) {}

  public async getAll() {
    return await this.categoriesRepository.findAll();
  }
}
