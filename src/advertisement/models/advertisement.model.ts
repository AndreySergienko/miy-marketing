import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Channel } from '../../channels/models/channels.model';
import { Status } from '../../status/models/status.model';
import { PublisherMessages } from '../../publisher-messages/models/publisher-messages.model';
import { Payment } from '../../payments/models/payment.model';
import { AdvertisementModelAttrs } from '../types/types';

@Table({ tableName: 'advertisement', createdAt: false, updatedAt: false })
export class Advertisement extends Model<
  Advertisement,
  AdvertisementModelAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT })
  timestamp: number;

  @Column({ type: DataType.BIGINT })
  timestampFinish: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  messageBotId: number;

  @ForeignKey(() => Channel)
  @Column({ type: DataType.BIGINT })
  channelId: number;

  @BelongsTo(() => Channel)
  channel: Channel;

  @ForeignKey(() => Status)
  @Column({ type: DataType.INTEGER })
  statusId: number;

  @BelongsTo(() => Status)
  status: Status;

  @Column({ type: DataType.INTEGER, allowNull: true })
  publisherId: number;

  @ForeignKey(() => PublisherMessages)
  @Column({ type: DataType.INTEGER, allowNull: true })
  messageId: number;

  @BelongsTo(() => PublisherMessages)
  message: PublisherMessages;

  @HasMany(() => Payment)
  payment: Payment;
}
