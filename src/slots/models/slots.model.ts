import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Channel } from '../../channels/models/channels.model';
import type { SlotsModelAttrs } from '../types/types';
import { Status } from '../../status/models/status.model';
import { PublisherMessages } from '../../publisher-messages/models/publisher-messages.model';
import { Payment } from '../../payments/models/payment.model';

@Table({ tableName: 'slots', createdAt: false, updatedAt: false })
export class Slots extends Model<Slots, SlotsModelAttrs> {
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

  @ForeignKey(() => PublisherMessages)
  @Column({ type: DataType.INTEGER, allowNull: true })
  messageId: number;

  @BelongsTo(() => PublisherMessages)
  message: PublisherMessages;

  @ForeignKey(() => Payment)
  @Column({ type: DataType.INTEGER })
  paymentId: number;

  // TODO много ко многим, т.к платёж могут повторить
  @BelongsTo(() => Payment)
  payment: Payment;
}
