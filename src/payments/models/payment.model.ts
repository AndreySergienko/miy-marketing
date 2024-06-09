import { Advertisement } from 'src/advertisement/models/advertisement.model';
import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import type { PaymentModelAttrs } from '../types/types';
import { UserPayment } from './user-payment.model';
import { Status } from '../../status/models/status.model';

@Table({ tableName: 'payment', updatedAt: false })
export class Payment extends Model<Payment, PaymentModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  price: number;

  @BelongsTo(() => Status)
  status: Status;

  @ForeignKey(() => Status)
  @Column({ type: DataType.INTEGER })
  statusId: number;

  @ForeignKey(() => Advertisement)
  @Column({ type: DataType.INTEGER })
  advertisementId: number;

  @BelongsTo(() => Advertisement)
  advertisement: Advertisement;

  @BelongsToMany(() => User, () => UserPayment)
  user: User;
}
