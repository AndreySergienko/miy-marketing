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

@Table({ tableName: 'slots', createdAt: false, updatedAt: false })
export class Slots extends Model<Slots, SlotsModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT, unique: true })
  timestamp: number;

  @ForeignKey(() => Channel)
  @Column({ type: DataType.INTEGER })
  channelId: number;

  @BelongsTo(() => Channel)
  channel: Channel;

  @ForeignKey(() => Status)
  @Column({ type: DataType.INTEGER })
  statusId: number;

  @BelongsTo(() => Status)
  status: Status;

  @ForeignKey(() => PublisherMessages)
  @Column({ type: DataType.INTEGER })
  messageId: number;

  @BelongsTo(() => PublisherMessages)
  message: PublisherMessages;
}
