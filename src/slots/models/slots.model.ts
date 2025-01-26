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
import { FormatChannel } from 'src/channels/models/format-channel.model';

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

  // Цена
  @Column({ type: DataType.INTEGER, allowNull: true })
  price: number;

  @HasMany(() => Advertisement)
  advertisements: Advertisement[];

  @Column({
    type: DataType.STRING,
    validate: {
      len: [1, 4],
    },
  })
  minutes: string;

  // Интервал
  @ForeignKey(() => FormatChannel)
  @Column({ type: DataType.INTEGER })
  formatChannelId: number;

  @BelongsTo(() => FormatChannel)
  formatChannel: FormatChannel;

  @ForeignKey(() => ChannelDate)
  @Column({ type: DataType.BIGINT })
  channelDateId: number;

  @BelongsTo(() => ChannelDate)
  channelDate: ChannelDate;
}
