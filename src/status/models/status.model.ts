import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import type { StatusModelAttrs } from '../types/types';
import { Channel } from '../../channels/models/channels.model';
import { Slots } from '../../slots/models/slots.model';

@Table({ tableName: 'status', createdAt: false, updatedAt: false })
export class Status extends Model<Status, StatusModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: true })
  value: string;

  @Column({ type: DataType.STRING })
  description: string;

  @HasMany(() => Channel)
  channels: Channel[];

  @HasMany(() => Slots)
  slots: Slots[];
}
