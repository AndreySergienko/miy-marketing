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
import { Slots } from '../../slots/models/slots.model';
import { FormatChannel } from './format-channel.model';

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

  @Column({ type: DataType.STRING, allowNull: true, validate: { isUrl: true } })
  link: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar: string;

  // Вынести в дальнейшем в заказ
  @Column({ type: DataType.INTEGER, allowNull: true })
  price: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  day: number;

  @BelongsToMany(() => User, () => UserChannel)
  users: User[];

  @BelongsToMany(() => Categories, () => CategoriesChannel)
  categories: Categories[];

  @ForeignKey(() => Status)
  @Column({ type: DataType.INTEGER })
  statusId: number;

  @BelongsTo(() => Status)
  status: Status;

  @HasMany(() => Slots)
  slots: Slots[];

  @ForeignKey(() => FormatChannel)
  @Column({ type: DataType.INTEGER })
  formatChannelId: number;

  @BelongsTo(() => FormatChannel)
  formatChannel: FormatChannel;
}
