import {
  Column,
  DataType,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';

@Table({ tableName: 'card', updatedAt: false })
export class Card extends Model<Card> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  number: string;

  @Column({ type: DataType.STRING, allowNull: false })
  date: string;

  @Column({ type: DataType.STRING, allowNull: false })
  cvc: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
