import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { Payment } from './payment.model';
import { Advertisement } from 'src/advertisement/models/advertisement.model';

@Table({ tableName: 'advertisement-payment', updatedAt: false })
export class AdvertisementPayment extends Model<AdvertisementPayment> {
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

  @ForeignKey(() => Advertisement)
  @Column({ type: DataType.INTEGER })
  advertisementId: number;
}
