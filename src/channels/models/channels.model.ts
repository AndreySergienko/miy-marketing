import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import type { ChannelsModelAttrs } from '../types/types';
import { User } from '../../user/models/user.model';
import { UserChannel } from './user-channel.model';
import { Categories } from '../../categories/models/categories.model';
import { CategoriesChannel } from '../../categories/models/categories-channel.model';
import { Status } from '../../status/models/status.model';
import { Advertisement } from 'src/advertisement/models/advertisement.model';
import { ChannelDate } from './channel-dates.model';

@Table({ tableName: 'channels' })
export class Channel extends Model<Channel, ChannelsModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT, unique: true })
  chatId: number;

  @Column({ type: DataType.STRING, unique: true })
  name: string;

  @Column({ type: DataType.INTEGER })
  subscribers: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isCanPostMessage: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  link: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar: string;

  // Условия для проверки
  @Column({ type: DataType.STRING, allowNull: true })
  conditionCheck: string;

  @BelongsToMany(() => User, () => UserChannel)
  users: User[];

  @BelongsToMany(() => Categories, () => CategoriesChannel)
  categories: Categories[];

  @ForeignKey(() => Status)
  @Column({ type: DataType.INTEGER })
  statusId: number;

  @BelongsTo(() => Status)
  status: Status;

  // Даты
  @HasMany(() => ChannelDate)
  channelDates: ChannelDate[];

  @HasMany(() => Advertisement)
  advertisements: Advertisement[];
}
