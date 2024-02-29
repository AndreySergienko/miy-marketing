import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
} from 'sequelize-typescript';
import { CategoriesModelAttrs } from '../types/types';
import { Channel } from '../../channels/models/channels.model';
import { CategoriesChannel } from './categories-channel.model';

@Table({ tableName: 'categories', createdAt: false, updatedAt: false })
export class Categories extends Model<Categories, CategoriesModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: true })
  value: string;

  @Column({ type: DataType.STRING })
  description: string;

  @BelongsToMany(() => Channel, () => CategoriesChannel)
  channel: Channel[];
}
