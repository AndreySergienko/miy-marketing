import {
  Column,
  DataType,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { MailModelAttrs } from '../types/nodemailer.types';

@Table({ tableName: 'mail' })
export class Mail extends Model<Mail, MailModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  counterSend: number;

  @Column({ type: DataType.STRING, unique: true })
  hash: string;

  // Время до повторной отправки
  @Column({ type: DataType.BIGINT })
  timeSend: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
