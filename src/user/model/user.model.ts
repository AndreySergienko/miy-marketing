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

  @Column({ type: DataType.STRING, unique: true })
  uniqueBotId: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: true })
  email: string;

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  isValidEmail: boolean;

  @Column({ type: DataType.BIGINT, unique: true, allowNull: true })
  inn: number;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  password: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  name: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  lastname: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  surname: string;

  // TODO набор сообщений для рекламы
  // TODO набор подключенных каналов
  // TODO связь с mail
}
