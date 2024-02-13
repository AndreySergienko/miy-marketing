import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
} from 'sequelize-typescript';
import { UserModelAttrs } from '../types/user.types';
import { Permission } from '../../permission/models/persmissions.model';
import { UserPermission } from '../../permission/models/user-permission.model';

@Table({ tableName: 'user' })
export class User extends Model<User, UserModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, unique: true })
  chatId: number;

  @Column({ type: DataType.STRING, unique: true })
  uniqueBotId: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: true })
  email: string;

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  isValidEmail: boolean;

  @Column({ type: DataType.INTEGER, unique: true, allowNull: true })
  inn: number;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  password: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  name: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  lastname: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: true })
  surname: string;

  @Column({ type: DataType.INTEGER, unique: false, allowNull: true })
  mailTimeSend: number;

  @Column({ type: DataType.INTEGER, unique: false, allowNull: true })
  mailCode: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isBan: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  banReason: string;

  @BelongsToMany(() => Permission, () => UserPermission)
  permissions: Permission[];

  // TODO набор сообщений для рекламы
  // TODO набор подключенных каналов
}
