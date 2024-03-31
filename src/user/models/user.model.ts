import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
  HasOne,
} from 'sequelize-typescript';
import { UserModelAttrs } from '../types/user.types';
import { Permission } from '../../permission/models/persmissions.model';
import { UserPermission } from '../../permission/models/user-permission.model';
import { Mail } from '../../nodemailer/model/nodemailer.model';
import { Channel } from '../../channels/models/channels.model';
import { UserChannel } from '../../channels/models/user-channel.model';

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

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
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

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isBan: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  banReason: string;

  @Column({ type: DataType.BIGINT, allowNull: true })
  lastUpdateEmail: number;

  @Column({ type: DataType.STRING, allowNull: true })
  lastActiveBot: string;

  // Уведомлять ли админа тг канала перед публикацией
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isNotification: boolean;

  @BelongsToMany(() => Permission, () => UserPermission)
  permissions: Permission[];

  @HasOne(() => Mail)
  mail: Mail;

  @BelongsToMany(() => Channel, () => UserChannel)
  channels: Channel[];
}
