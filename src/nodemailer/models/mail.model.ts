import { Column, DataType, Table, Model } from 'sequelize-typescript';
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

  @Column({ type: DataType.NUMBER, unique: true })
  userId: number;

  @Column({ type: DataType.STRING, unique: true })
  messageCode: number;

  @Column({ type: DataType.NUMBER })
  timestamp: number;

  // TODO связь с юзером
}
