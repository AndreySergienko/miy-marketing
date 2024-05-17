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
import { Slots } from '../../slots/models/slots.model';
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

  @ForeignKey(() => Slots)
  @Column({ type: DataType.INTEGER })
  slotId: number;

  @BelongsTo(() => Slots)
  slot: Slots;

  @BelongsToMany(() => User, () => UserPayment)
  user: User;
}
