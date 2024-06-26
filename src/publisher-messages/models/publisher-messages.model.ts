import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  HasOne,
} from 'sequelize-typescript';
import { Slots } from '../../slots/models/slots.model';
import { User } from '../../user/models/user.model';

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

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @HasOne(() => Slots)
  slot: Slots;
}
