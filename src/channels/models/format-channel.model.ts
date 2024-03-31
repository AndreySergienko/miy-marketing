import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import { Channel } from './channels.model';

@Table({ tableName: 'format-channel', createdAt: false, updatedAt: false })
export class FormatChannel extends Model<FormatChannel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  value: string;

  @HasMany(() => Channel)
  channels: Channel[];
}
