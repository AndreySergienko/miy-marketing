import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { BotModelAttrs } from '../types/bot.types';

@Table({ tableName: 'bot' })
export class Bot extends Model<Bot, BotModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT, unique: false })
  chatId: number;

  @Column({ type: DataType.BIGINT, unique: true })
  userId: number;

  @Column({ type: DataType.BIGINT })
  date: number;
}
