import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
} from 'sequelize-typescript';
import { ChannelsModelAttrs } from '../types/types';
import { User } from '../../user/models/user.model';
import { UserChannel } from './user-channel.model';

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

  @BelongsToMany(() => User, () => UserChannel)
  users: User[];
  // @Column({ type: DataType.INTEGER })
  // price: number;

  // @BelongsToMany(() => Categories, () => UserPermission)
  // categories: Categories[];

  // Статус канала должен быть валиден
}
