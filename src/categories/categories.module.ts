import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Categories } from './models/categories.model';
import { Channel } from '../channels/models/channels.model';
import { CategoriesChannel } from './models/categories-channel.model';
import { CategoriesController } from './categories.controller';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [
    SequelizeModule.forFeature([Categories, Channel, CategoriesChannel]),
  ],
})
export class CategoriesModule {}
