import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { Categories } from './categories.model';
import { Channel } from '../../channels/models/channels.model';

@Table({ tableName: 'category-channel', createdAt: false, updatedAt: false })
export class CategoriesChannel extends Model<CategoriesChannel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Channel)
  @Column({ type: DataType.INTEGER })
  channelId: number;

  @ForeignKey(() => Categories)
  @Column({ type: DataType.INTEGER })
  categoriesId: number;
}
