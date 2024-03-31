import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { Payment } from './payment.model';
import { Slots } from '../../slots/models/slots.model';

@Table({ tableName: 'slot-payment', updatedAt: false })
export class SlotPayment extends Model<SlotPayment> {
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

  @ForeignKey(() => Slots)
  @Column({ type: DataType.INTEGER })
  slotId: number;
}
