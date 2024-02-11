import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { AuthModelAttrs } from '../types/auth.types';

@Table({ tableName: 'auth' })
export class Auth extends Model<Auth, AuthModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT, unique: true })
  chatId: number;

  @Column({ type: DataType.STRING, unique: true })
  uniqueBotId: string;

  // TODO Связь с юзером
}
