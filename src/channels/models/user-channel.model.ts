import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { Channel } from './channels.model';

@Table({ tableName: 'user-channel', createdAt: false, updatedAt: false })
export class UserChannel extends Model<UserChannel> {
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

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;
}
