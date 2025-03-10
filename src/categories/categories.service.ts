import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Categories } from './models/categories.model';
import { CategoriesChannel } from './models/categories-channel.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories) private categoriesRepository: typeof Categories,
    @InjectModel(CategoriesChannel)
    private categoriesChannelRepository: typeof CategoriesChannel,
  ) {}

  public async getAll() {
    const categories = await this.categoriesRepository.findAll();
    const transformed = [];
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const channelsCount = await this.categoriesChannelRepository.findAll({
        where: { categoriesId: category.id },
      });
      transformed.push({
        id: category.id,
        value: category.value,
        description: category.description,
        count: channelsCount.length,
      });
    }

    return transformed;
  }
}
