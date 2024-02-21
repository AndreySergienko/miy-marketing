import { Column, DataType, Table, Model } from 'sequelize-typescript';
import type { StatusModelAttrs } from '../types/types';

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
}
