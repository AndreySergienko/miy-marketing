import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { UserModelAttrs } from '../types/user.types';

@Table({ tableName: 'user' })
export class User extends Model<User, UserModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT, unique: true })
  chatId: number;

  @Column({ type: DataType.BIGINT, unique: true })
  uniqueBotId: number;

  @Column({ type: DataType.STRING, unique: true })
  email: string;

  @Column({ type: DataType.BOOLEAN })
  isValidEmail: boolean;

  @Column({ type: DataType.BIGINT, unique: true })
  inn: number;

  @Column({ type: DataType.STRING, unique: false })
  password: string;

  @Column({ type: DataType.STRING, unique: false })
  name: string;

  @Column({ type: DataType.STRING, unique: false })
  lastname: string;

  @Column({ type: DataType.STRING, unique: false })
  surname: string;

  // TODO набор сообщений для рекламы
  // TODO набор подключенных каналов
  // TODO связь с auth
  // TODO связь с mail
}
