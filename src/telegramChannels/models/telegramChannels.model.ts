import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
} from 'sequelize-typescript';
import { TelegramChannelsModelAttrs } from '../types/types';
import { Categories } from '../../categories/models/categories.model';
import { UserPermission } from '../../permission/models/user-permission.model';

@Table({ tableName: 'channels' })
export class TelegramChannels extends Model<
  TelegramChannels,
  TelegramChannelsModelAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.INTEGER })
  subscribers: number;

  @Column({ type: DataType.STRING })
  link: string;

  @Column({ type: DataType.INTEGER })
  price: number;

  @BelongsToMany(() => Categories, () => UserPermission)
  categories: Categories[];
}
