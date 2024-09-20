import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Channel } from './channels.model';
import { Slots } from 'src/slots/models/slots.model';
import { FormatChannel } from './format-channel.model';

@Table({ tableName: 'channel-dates', createdAt: false, updatedAt: false })
export class ChannelDate extends Model<ChannelDate> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  // Дата
  @Column({ type: DataType.STRING })
  date: string;

  // Цена
  @Column({ type: DataType.INTEGER, allowNull: true })
  price: number;

  // Временные промежутки
  @HasMany(() => Slots)
  slots: Slots[];

  // Интервал
  @ForeignKey(() => FormatChannel)
  @Column({ type: DataType.INTEGER })
  formatChannelId: number;

  @BelongsTo(() => FormatChannel)
  formatChannel: FormatChannel;

  // К какому каналу принадлежит
  @ForeignKey(() => Channel)
  @Column({ type: DataType.INTEGER })
  channelId: number;

  @BelongsTo(() => Channel)
  channel: Channel;
}
