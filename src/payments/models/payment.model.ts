import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { Slots } from '../../slots/models/slots.model';
import { SlotPayment } from './slot-payment.model';
import { UserPayment } from './user-payment.model';
import type { PaymentModelAttrs } from '../types/types';

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

  @BelongsToMany(() => Slots, () => UserPayment)
  @Column({ type: DataType.INTEGER })
  slot: Slots;

  @BelongsToMany(() => User, () => SlotPayment)
  @Column({ type: DataType.INTEGER })
  user: User;
}
