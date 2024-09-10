import {
  Column,
  DataType,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import type { UserBankModelAttrs } from '../types/types';

@Table({ tableName: 'user-bank', updatedAt: false })
export class UserBank extends Model<UserBank, UserBankModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  bik: string;

  @Column({ type: DataType.STRING, allowNull: true })
  correspondentAccount: string;

  @Column({ type: DataType.STRING, allowNull: true })
  currentAccount: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
