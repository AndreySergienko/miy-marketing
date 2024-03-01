import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { Status } from '../../status/models/status.model';
import { Slots } from '../../slots/models/slots.model';

const MAX_LENGTH_MESSAGE = 200;

@Table({ tableName: 'publisherMessages', createdAt: false, updatedAt: false })
export class PublisherMessages extends Model<PublisherMessages> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    validate: {
      max: MAX_LENGTH_MESSAGE,
    },
  })
  message: string;

  @ForeignKey(() => Status)
  @Column({ type: DataType.INTEGER })
  statusId: number;

  @BelongsTo(() => Status)
  status: Status;

  @HasOne(() => Slots)
  slot: Slots;
}
