import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import type { SlotsModelAttrs } from '../types/types';
import { Advertisement } from 'src/advertisement/models/advertisement.model';
import { ChannelDate } from 'src/channels/models/channel-dates.model';

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

  @HasMany(() => Advertisement)
  advertisements: Advertisement[];

  @ForeignKey(() => ChannelDate)
  @Column({ type: DataType.BIGINT })
  channelDateId: number;

  @BelongsTo(() => ChannelDate)
  channelDate: ChannelDate;
}
