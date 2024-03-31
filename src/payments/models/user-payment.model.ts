import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { Payment } from './payment.model';

@Table({ tableName: 'user-payment', updatedAt: false })
export class UserPayment extends Model<UserPayment> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Payment)
  @Column({ type: DataType.INTEGER })
  paymentId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;
}
